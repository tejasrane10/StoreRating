import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function normalizeValue(value) {
  if (value == null) return '';
  if (typeof value === 'object') {
    if ('label' in value) return value.label;
    return JSON.stringify(value);
  }
  return String(value);
}

function buildRows(columns, rows) {
  return rows.map((row) => {
    const record = {};
    columns.forEach((column) => {
      const key = column.accessor ?? column.header;
      const value = column.render ? column.render(row[column.accessor], row) : row[column.accessor];
      record[key] = normalizeValue(value);
    });
    return record;
  });
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportTableToCsv(columns, rows, filename) {
  const headers = columns.map((column) => column.header);
  const body = rows.map((row) =>
    columns.map((column) => JSON.stringify(normalizeValue(row[column.accessor]))).join(',')
  );
  const csv = [headers.join(','), ...body].join('\n');
  triggerDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
}

export function exportTableToExcel(columns, rows, filename) {
  const sheetRows = buildRows(columns, rows);
  const worksheet = XLSX.utils.json_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  triggerDownload(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${filename}.xlsx`);
}

export function exportTableToPdf(columns, rows, filename, title) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  doc.setFontSize(16);
  doc.text(title, 40, 36);
  autoTable(doc, {
    startY: 52,
    head: [columns.map((column) => column.header)],
    body: rows.map((row) => columns.map((column) => normalizeValue(row[column.accessor]))),
    styles: {
      fontSize: 8,
      cellPadding: 6,
      fillColor: [30, 41, 59],
      textColor: [241, 245, 249],
      lineColor: [51, 65, 85],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [241, 245, 249],
    },
    alternateRowStyles: {
      fillColor: [24, 34, 54],
    },
  });
  doc.save(`${filename}.pdf`);
}
