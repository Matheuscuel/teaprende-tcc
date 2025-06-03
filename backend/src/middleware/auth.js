const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
  // Obter o token do cabeçalho de autorização
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: true, message: "Token não fornecido" })
  }

  // O formato esperado é "Bearer TOKEN"
  const parts = authHeader.split(" ")

  if (parts.length !== 2) {
    return res.status(401).json({ error: true, message: "Erro no formato do token" })
  }

  const [scheme, token] = parts

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: true, message: "Token mal formatado" })
  }

  // Verificar se o token é válido
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: true, message: "Token inválido" })
    }

    // Se o token for válido, salva o ID do usuário para uso nas rotas
    req.userId = decoded.id
    req.userRole = decoded.role

    return next()
  })
}

// Middleware para verificar se o usuário tem permissão de administrador
const isAdmin = (req, res, next) => {
  if (req.userRole !== "terapeuta" && req.userRole !== "professor") {
    return res.status(403).json({ error: true, message: "Acesso negado: permissão insuficiente" })
  }

  return next()
}

module.exports = { authMiddleware, isAdmin }

