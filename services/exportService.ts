export function exportToExcel(filename: string, headers: string[], rows: string[][]) {
  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>';
  html += '<table border="1" style="border-collapse:collapse;font-family:Inter,sans-serif;font-size:12px">';
  html += '<thead><tr>' + headers.map(h => '<th style="background:#0f172a;color:white;padding:8px;font-weight:600">' + esc(h) + '</th>').join('') + '</tr></thead>';
  html += '<tbody>' + rows.map(r => '<tr>' + r.map(c => '<td style="padding:6px;border:1px solid #e5e7eb">' + esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody>';
  html += '</table></body></html>';

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xls') ? filename : filename + '.xls';
  a.click();
  URL.revokeObjectURL(url);
}

function esc(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function exportToCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}
