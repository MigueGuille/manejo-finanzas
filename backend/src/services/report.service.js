import { jsPDF } from "jspdf";
import { transactionRepository } from "../repositories/transaction.repository.js";
import { normalizeMoney } from "./financeMath.service.js";

export const reportService = {
  async export(userId, query) {
    const { items } = await transactionRepository.findMany(userId, { ...query, page: 1, pageSize: 1000 });
    if (query.format === "pdf") {
      return buildPdf(items);
    }
    return buildCsv(items);
  }
};

const buildCsv = (items) => {
  const header = ["fecha", "tipo", "categoria", "monto_original", "moneda", "tasa", "monto_usd", "monto_bs", "diferencial_bs", "metodo_pago", "descripcion"];
  const rows = items.map((item) => [
    item.transactionDate.toISOString().slice(0, 10),
    item.type,
    item.category?.name || "",
    normalizeMoney(item.amount).toFixed(2),
    item.currency || "USD",
    item.exchangeRate ? normalizeMoney(item.exchangeRate).toFixed(4) : "",
    normalizeMoney(item.amountUsd).toFixed(2),
    normalizeMoney(item.amountBs).toFixed(2),
    normalizeMoney(item.exchangeDifferenceBs).toFixed(2),
    item.paymentMethod || "",
    item.description || ""
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  return { contentType: "text/csv", filename: "reporte-finanzas.csv", body: csv };
};

const csvCell = (value) => `"${String(value).replaceAll('"', '""')}"`;

const buildPdf = (items) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Reporte de finanzas", 14, 18);
  doc.setFontSize(10);
  let y = 30;
  items.forEach((item) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(
      `${item.transactionDate.toISOString().slice(0, 10)} | ${item.type} | ${item.category?.name || ""} | ${normalizeMoney(item.amount).toFixed(2)} ${item.currency || "USD"} | USD ${normalizeMoney(item.amountUsd).toFixed(2)} | Bs ${normalizeMoney(item.amountBs).toFixed(2)}`,
      14,
      y
    );
    y += 7;
  });

  return {
    contentType: "application/pdf",
    filename: "reporte-finanzas.pdf",
    body: Buffer.from(doc.output("arraybuffer"))
  };
};
