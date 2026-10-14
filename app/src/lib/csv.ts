/**
 * One CSV cell. Quotes are doubled, and text that a spreadsheet would read as a
 * formula (starting with = + - @, tab or carriage return) is prefixed with an
 * apostrophe so it is shown as text instead of being executed.
 */
export function csvCell(value: string | number | boolean): string {
  if (typeof value !== 'string') return String(value);
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function downloadCsv(filename: string, header: string[], rows: (string | number | boolean)[][]) {
  const text = [header.join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
