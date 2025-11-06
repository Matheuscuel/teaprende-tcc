const PDFDocument = require("pdfkit");

function dateRange(q) {
  const from = q?.from || new Date(Date.now() - 30 * 864e5).toISOString().slice(0,10);
  const to   = q?.to   || new Date().toISOString().slice(0,10);
  return { from, to };
}

exports.pdf = async (req, res, next) => {
  try {
    const { childId } = req.params;
    const { from, to } = dateRange(req.query);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="relatorio_${childId}_${to}.pdf"`);

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    doc.fontSize(18).text("Relatório da Criança", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Criança ID: ${childId}`);
    doc.text(`Período: ${from} → ${to}`);
    doc.moveDown();

    doc.fontSize(14).text("Resumo", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text("PDF de teste gerado via pdfkit. Integre aqui os dados reais dos endpoints.");

    // Exemplo (opcional) usando req.db:
    // const { rows } = await req.db.query("SELECT name FROM children WHERE id = $1", [childId]);
    // const nome = rows?.[0]?.name ?? `#${childId}`;
    // doc.moveDown().text(`Nome: ${nome}`);

    doc.end();
  } catch (err) {
    next(err);
  }
};
