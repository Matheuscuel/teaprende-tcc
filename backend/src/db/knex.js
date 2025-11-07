const knex = require("knex");
let knexfile;
try { knexfile = require("../../knexfile.js"); } catch (e) { knexfile = require("../../knexfile.cjs"); }
const env = process.env.NODE_ENV || "development";
module.exports = knex(knexfile[env]);
