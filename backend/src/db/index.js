/**
 * Adaptador de DB para compatibilizar require("../db") com Knex.
 */
const path = require("path");
let knex;
try { knex = require("./knex"); } catch (e) { knex = require(path.join(__dirname, "knex.js")); }
async function query(text, params) {
  const res = await knex.raw(text, params || []);
  return res && res.rows ? res : { rows: (res && res.rows) ? res.rows : [] };
}
module.exports = Object.assign(knex, { query });
