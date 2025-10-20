const knex = require("../db/knex");
const jwt = require("jsonwebtoken");

function getUserFromReq(req) {
  const auth = req.headers.authorization || "";
  const parts = auth.split(" ");
  const token = parts.length === 2 ? parts[1] : null;
  if (!token) throw new Error("No token");
  return jwt.verify(token, process.env.JWT_SECRET || "secret");
}

exports.listMine = async (req, res) => {
  try {
    const user = getUserFromReq(req); // { id, role, name, email, ... }
    const rows = await knex("children")
      .select("children.id", "children.name")
      .join("user_children", "user_children.child_id", "children.id")
      .where("user_children.user_id", user.id)
      .orderBy("children.id", "asc");
    res.json(rows);
  } catch (err) {
    console.error("children.mine", err);
    res.status(401).json({ error: "unauthorized" });
  }
};
