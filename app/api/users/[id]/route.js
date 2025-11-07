// API Route: GET/PUT/DELETE usuário por ID
import { usersStore } from "../../../lib/usersStore";

export const dynamic = "force-dynamic";

// GET /api/users/[id] - Buscar usuário por ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const user = usersStore.getById(id);

    if (!user) {
      return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    return Response.json(
      { error: "Erro ao buscar usuário: " + error.message },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Atualizar usuário
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, role } = body;

    // Verificar se usuário existe
    const existing = usersStore.getById(id);
    if (!existing) {
      return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Validação
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return Response.json(
          { error: "Nome não pode ser vazio" },
          { status: 400 }
        );
      }
    }

    if (role !== undefined) {
      if (typeof role !== "string" || !role.trim()) {
        return Response.json(
          { error: "Papel não pode ser vazio" },
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
    }

    // Atualizar
    const updated = usersStore.update(id, {
      ...(name !== undefined && { name: name.trim() }),
      ...(role !== undefined && { role }),
    });

    return Response.json(updated);
  } catch (error) {
    return Response.json(
      { error: "Erro ao atualizar usuário: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Deletar usuário
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const deleted = usersStore.delete(id);
    if (!deleted) {
      return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return Response.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    return Response.json(
      { error: "Erro ao deletar usuário: " + error.message },
      { status: 500 }
    );
  }
}

