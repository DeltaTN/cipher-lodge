import Papa from "papaparse";
import jsPDF from "jspdf";

export function exportToCSV<T>(rows: T[], filename: string) {
  const csv = Papa.unparse(rows as any);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToPDF<T extends Record<string, any>>(rows: T[], filename: string) {
  const doc = new jsPDF();
  const lineHeight = 8;
  let y = 10;

  if (rows.length === 0) {
    doc.text("Aucune donnée", 10, y);
  } else {
    const headers = Object.keys(rows[0]);
    doc.setFontSize(11);
    doc.text(headers.join(" | "), 10, y);
    y += lineHeight;
    rows.forEach((row) => {
      const line = headers.map((h) => String(row[h] ?? "")).join(" | ");
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      doc.text(line, 10, y);
      y += lineHeight;
    });
  }
  doc.save(`${filename}.pdf`);
}
