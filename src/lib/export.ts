import * as XLSX from "xlsx";

export function esportaExcel(
  dati: object[],
  nomeFile: string,
  nomeSheet = "Dati",
) {
  const ws = XLSX.utils.json_to_sheet(dati);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nomeSheet);
  XLSX.writeFile(wb, `${nomeFile}.xlsx`);
}
