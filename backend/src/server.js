const reportsRoutes = require('./routes/reports');
const skillsRoutes = require('./routes/skills');
const progressRoutes = require('./routes/progress');
require("dotenv").config();
let app = require("./app");
if (app && app.default) app = app.default;

if (!app || typeof app.listen !== "function") {
  console.error("app não é Express. Valor:", app);
  process.exit(1);
}

const PORT = process.env.PORT || 3001;
app.use('/skills', skillsRoutes);
app.use('/progress', progressRoutes);
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});


// reports export (csv)
app.use('/reports', reportsRoutes);




