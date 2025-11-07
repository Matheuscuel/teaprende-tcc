const cors = require("cors");

module.exports = (app) => {
  const allow = (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",").map(s => s.trim()).filter(Boolean);
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);            // tools como curl/postman
      const ok = allow.includes(origin);
      cb(ok ? null : new Error("Not allowed by CORS"), ok);
    },
    credentials: true
  }));
};
