const jwt  = require('jsonwebtoken')
const knex = require('../db/knex')

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

function getUserIdFromReq(req) {
  try {
    if (req.userId) return req.userId
    if (req.user && (req.user.id || req.user.sub || req.user.userId)) {
      return req.user.id || req.user.sub || req.user.userId
    }
    const h = (req.headers && req.headers.authorization) || ''
    const t = h.split(' ')[1] || ''
    if (!t) return null
    const d = jwt.verify(t, JWT_SECRET)
    return d.id || d.sub || d.userId || null
  } catch (e) {
    return null
  }
}

exports.listMine = async (req, res) => {
  const userId = getUserIdFromReq(req)
  if (!userId) return res.status(401).json({ error: 'unauthorized' })
  try {
    const rows = await knex('children')
      .join('user_children', 'user_children.child_id', 'children.id')
      .where('user_children.user_id', userId)
      .select('children.id', 'children.name')
      .orderBy('children.id', 'asc')

    return res.json(rows)
  } catch (err) {
    console.error('children.mine error', err)
    return res.status(500).json({ error: 'internal' })
  }
}
