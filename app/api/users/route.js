// API Route: GET lista de usuários com busca/paginação; POST cria usuário
import { usersStore } from "../../lib/usersStore";

export const dynamic = "force-dynamic";

// GET /api/users?q=termo&page=1&pageSize=10
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    if (page < 1 || pageSize < 1) {
      return Response.json(
        { error: "Página e tamanho devem ser maiores que 0" },
        { status: 400 }
      );
    }

    // Buscar todos os usuários (com filtro)
    const allUsers = usersStore.getAll(q);
    const total = allUsers.length;

    // Paginar
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = allUsers.slice(start, end);

    return Response.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return Response.json(
      { error: "Erro ao buscar usuários: " + error.message },
      { status: 500 }
    );
  }
}

// POST /api/users - Criar novo usuário
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, role } = body;

    // Validação
    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    if (!role || typeof role !== "string" || !role.trim()) {
      return Response.json(
        { error: "Papel é obrigatório" },
        { status: 400 }
      );
    }

    const validRoles = ["Professor", "Terapeuta", "Responsável"];
    if (!validRoles.includes(role)) {
      return Response.json(
        { error: "Papel deve ser: Professor, Terapeuta ou Responsável" },
        { status: 400 }
      );
    }

    // Criar usuário
    const user = usersStore.create({ name, role });
    return Response.json(user, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: "Erro ao criar usuário: " + error.message },
      { status: 500 }
    );
  }
}

