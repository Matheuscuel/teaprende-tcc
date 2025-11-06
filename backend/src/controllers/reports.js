const pdfCtrl = (() => { try { return require("./reportsPdfController.js"); } catch { return null; } })();

function dateRange(q){
  const from = q?.from || new Date(Date.now() - 30*24*3600*1000).toISOString().slice(0,10);
  const to   = q?.to   || new Date().toISOString().slice(0,10);
  return { from, to };
}

exports.pdf = async (req, res, next) => {
  if (pdfCtrl?.pdf) return pdfCtrl.pdf(req,res,next);
  return res.status(501).json({ message: "Geração de PDF indisponível" });
};

exports.progress = async (req, res) => {
  const { childId } = req.params;
  const { from, to } = dateRange(req.query);
  return res.status(200).json({ childId: Number(childId), from, to, progress: [] });
};

exports.skills = async (req, res) => {
  const { childId } = req.params;
  const { from, to } = dateRange(req.query);
  return res.status(200).json({ childId: Number(childId), from, to, skills: [] });
};

exports.timeSpent = async (req, res) => {
  const { childId } = req.params;
  const { from, to } = dateRange(req.query);
  return res.status(200).json({ childId: Number(childId), from, to, timeSpent: [] });
};

exports.recommendations = async (req, res) => {
  const { childId } = req.params;
  const { from, to } = dateRange(req.query);
  return res.status(200).json({ childId: Number(childId), from, to, recommendations: [] });
};
