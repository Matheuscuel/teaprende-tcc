const db = require("../database/db");
const PDFDocument = require("pdfkit");

function parseDate(s, def) {
  if (!s) return def;
  const t = new Date(s);
  return isNaN(+t) ? def : t;
}

exports.childReportPdf = async (req, res) => {
  try {
    const { childId } = req.params;
    const from = parseDate(req.query.from, new Date(Date.now() - 30*24*3600*1000)); // 30 dias
    const to   = parseDate(req.query.to, new Date());

    // dados básicos
    const child = await db("children").where({ id: childId }).first();

    // métricas
    const [{ count: tasksCompleted = "0" } = {}] =
      await db("child_tasks").where({ child_id: childId, status: "completed" }).count();

    const [{ sum: rewardPoints = "0" } = {}] =
      await db("child_rewards").where({ child_id: childId }).sum({ sum: "points_awarded" });

    const agg = await db("game_sessions2")
      .where("child_id", childId)
      .andWhere("created_at", ">=", from)
      .andWhere("created_at", "<=", to)
      .count({ sessions: "*" })
      .avg({ avg_score: "score", avg_duration: "duration_seconds" })
      .first();

    // PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=report_child_${childId}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text("TEAprende - Relatório da Criança", { align: "center" }).moveDown(1);
    doc.fontSize(12).text(`Criança: ${child?.name || "#"+childId}`);
    doc.text(`Período: ${from.toISOString().slice(0,10)} a ${to.toISOString().slice(0,10)}`).moveDown(1);

    doc.text(`Tarefas concluídas: ${tasksCompleted}`);
    doc.text(`Pontos de recompensas: ${rewardPoints}`);
    doc.text(`Sessões de jogo (memory): ${agg?.sessions ?? 0}`);
    doc.text(`Média de score: ${Number(agg?.avg_score ?? 0).toFixed(1)}`);
    doc.text(`Média de duração (s): ${Number(agg?.avg_duration ?? 0).toFixed(1)}`);

    doc.moveDown(1).text("Observações:", { underline: true }).moveDown(0.5);
    doc.text("- Este é um relatório simples (MVP) gerado automaticamente.");
    doc.text("- Para versões futuras: gráficos e comparação entre períodos.");

    doc.end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
