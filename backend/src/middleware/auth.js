const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
  // Obter o token do cabeÃ§alho de autorizaÃ§Ã£o
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: true, message: "Token nÃ£o fornecido" })
  }

  // O formato esperado Ã© "Bearer TOKEN"
  const parts = authHeader.split(" ")

  if (parts.length !== 2) {
    return res.status(401).json({ error: true, message: "Erro no formato do token" })
  }

  const [scheme, token] = parts

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: true, message: "Token mal formatado" })
  }

  // Verificar se o token Ã© vÃ¡lido
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: true, message: "Token invÃ¡lido" })
    }

    // Se o token for vÃ¡lido, salva o ID do usuÃ¡rio para uso nas rotas
    req.userId = ((decoded.id || decoded.sub || decoded.userId) ?? decoded.sub ?? decoded.userId ?? decoded.user_id)
    req.userRole = decoded.role

    return next()
  })
}

// Middleware para verificar se o usuÃ¡rio tem permissÃ£o de administrador
const isAdmin = (req, res, next) => {
  if (req.userRole !== "terapeuta" && req.userRole !== "professor") {
    return res.status(403).json({ error: true, message: "Acesso negado: permissÃ£o insuficiente" })
  }

  return next()
}

module.exports = { authMiddleware, isAdmin }



