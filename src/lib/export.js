/* Lightweight, dependency-free export helpers. */

/** Download rows as a UTF-8 CSV (Excel-friendly; BOM keeps Arabic intact). */
export function exportCsv(filename, headers, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n')
  const blob = new Blob(['﻿' + csv, ''], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/** Today's date as YYYY-MM-DD (for filenames). */
export function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * "PDF export" without dependencies: opens the browser print dialog.
 * Add `.print-area` to the report root and rely on the global @media print
 * rules (see main.css) that hide everything else.
 */
export function printReport() {
  window.print()
}
