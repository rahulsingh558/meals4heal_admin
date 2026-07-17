/**
 * Convert an array of row objects into a CSV string and trigger a browser download.
 * Values are quoted and internal quotes escaped so commas/newlines are safe.
 */
export function downloadCsv(filename: string, rows: Record<string, any>[]): void {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);
    const escape = (value: any): string => {
        const s = value === null || value === undefined ? '' : String(value);
        return `"${s.replace(/"/g, '""')}"`;
    };

    const lines = [
        headers.map(escape).join(','),
        ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
    ];

    const csv = lines.join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
