/**
 * Frontend PDF & Excel (.xlsx) Report Generator
 * Menghasilkan file PDF (A4 Landscape dengan tabel vektor & kop SMA Double Track)
 * serta file Excel (.xlsx OpenXML asli) langsung di browser tanpa dependensi eksternal.
 */

const enc = new TextEncoder();

function escapeXml(val) {
    return String(val ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function escapePdfText(str) {
    // Normalize non-ASCII characters to safe WinAnsi / ASCII equivalents
    return String(str ?? '')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/\u2022/g, '*')
        .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ')
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
}

function wrapText(text, maxChars) {
    const clean = String(text ?? '-')
        .replace(/\r?\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!clean) return ['-'];
    const words = clean.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
        if (!current) {
            if (word.length > maxChars) {
                lines.push(word.slice(0, maxChars));
                current = word.slice(maxChars);
            } else {
                current = word;
            }
        } else if (current.length + 1 + word.length <= maxChars) {
            current += ' ' + word;
        } else {
            lines.push(current);
            current = word.length > maxChars ? word.slice(0, maxChars) : word;
        }
    }
    if (current) lines.push(current);
    return lines.slice(0, 5); // batasi maks 5 baris per sel agar tabel tetap rapi
}

/**
 * Generate & Open/Download PDF Report in Frontend
 * @param {Object} config
 * @param {string} config.title - Judul laporan
 * @param {string} config.subtitle - Subjudul / deskripsi laporan
 * @param {string} config.filename - Nama file output tanpa ekstensi
 * @param {Array<{header: string, width: number, accessor: (row: any, idx: number) => string}>} config.columns
 * @param {Array<any>} config.data
 * @param {Array<{label: string, value: string}>} [config.summary]
 */
export function exportToPdfReport({
    title,
    subtitle = '',
    filename = 'Laporan-Double-Track',
    columns = [],
    data = [],
    summary = [],
}) {
    const pageW = 841.89; // A4 Landscape width (pt)
    const pageH = 595.28; // A4 Landscape height (pt)
    const marginX = 32;
    const usableW = pageW - marginX * 2;

    // Normalize column widths to fit usableW
    const totalColWeight = columns.reduce((acc, c) => acc + (c.width || 100), 0) || 1;
    const normCols = columns.map((c) => {
        const w = ((c.width || 100) / totalColWeight) * usableW;
        const maxChars = Math.max(8, Math.floor((w - 10) / 4.4));
        return { ...c, ptWidth: w, maxChars };
    });

    const nowStr = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date());

    // Pre-calculate wrapped rows
    const preparedRows = data.map((row, idx) => {
        const cellLines = normCols.map((col) => {
            const raw = col.accessor(row, idx);
            return wrapText(raw, col.maxChars);
        });
        const maxLines = Math.max(1, ...cellLines.map((l) => l.length));
        const rowHeight = Math.max(20, maxLines * 10.5 + 8);
        return { cellLines, rowHeight };
    });

    // Paginate rows
    const pages = [];
    let currentPageRows = [];
    let currentY = pageH - 132; // first page table start Y (after header & summary)
    const bottomLimit = 46;
    const headerRowH = 22;

    if (preparedRows.length === 0) {
        pages.push({ rows: [], isFirst: true });
    } else {
        let isFirstPage = true;
        currentY -= headerRowH;

        for (let i = 0; i < preparedRows.length; i++) {
            const item = preparedRows[i];
            if (currentY - item.rowHeight < bottomLimit && currentPageRows.length > 0) {
                pages.push({ rows: currentPageRows, isFirst: isFirstPage });
                currentPageRows = [];
                isFirstPage = false;
                currentY = pageH - 84 - headerRowH;
            }
            currentPageRows.push(item);
            currentY -= item.rowHeight;
        }
        if (currentPageRows.length > 0) {
            pages.push({ rows: currentPageRows, isFirst: isFirstPage });
        }
    }

    const totalPages = pages.length;

    // Build content stream for each page
    const pageStreams = pages.map((pg, pageIdx) => {
        const cmds = [];

        // Top Brand Bar: Navy (#203880 -> 0.125 0.220 0.502) & Amber (#f8a000 -> 0.973 0.627 0.0)
        cmds.push('0.125 0.220 0.502 rg');
        cmds.push(`${marginX} ${pageH - 28} ${usableW * 0.75} 5 re f`);
        cmds.push('0.973 0.627 0.000 rg');
        cmds.push(`${marginX + usableW * 0.75} ${pageH - 28} ${usableW * 0.25} 5 re f`);

        // Header Institution Title
        cmds.push('BT');
        cmds.push('/F2 13 Tf');
        cmds.push('0.125 0.220 0.502 rg');
        cmds.push(`${marginX} ${pageH - 46} Td`);
        cmds.push(`(${escapePdfText(title.toUpperCase())}) Tj`);
        cmds.push('ET');

        cmds.push('BT');
        cmds.push('/F1 8.5 Tf');
        cmds.push('0.392 0.455 0.545 rg');
        cmds.push(`${marginX} ${pageH - 59} Td`);
        cmds.push(
            `(${escapePdfText(
                subtitle || 'Program Ruang Alumni SMA Double Track — Dinas Pendidikan Provinsi Jawa Timur & ITS'
            )}) Tj`
        );
        cmds.push('ET');

        // Right-aligned Print Timestamp
        cmds.push('BT');
        cmds.push('/F1 8 Tf');
        cmds.push('0.392 0.455 0.545 rg');
        cmds.push(`${pageW - marginX - 185} ${pageH - 46} Td`);
        cmds.push(`(Dicetak: ${escapePdfText(nowStr)}) Tj`);
        cmds.push('ET');

        let tableTopY = pageH - 74;

        // Summary boxes on first page
        if (pg.isFirst && summary.length > 0) {
            const boxY = pageH - 102;
            const boxW = Math.min(180, (usableW - (summary.length - 1) * 8) / summary.length);
            summary.forEach((s, sIdx) => {
                const bx = marginX + sIdx * (boxW + 8);
                cmds.push('0.973 0.980 0.992 rg');
                cmds.push('0.859 0.890 0.941 RG 0.7 w');
                cmds.push(`${bx} ${boxY} ${boxW} 24 re B`);

                cmds.push('BT /F1 7.5 Tf 0.392 0.455 0.545 rg');
                cmds.push(`${bx + 7} ${boxY + 14} Td (${escapePdfText(s.label)}) Tj ET`);

                cmds.push('BT /F2 9.5 Tf 0.125 0.220 0.502 rg');
                cmds.push(`${bx + 7} ${boxY + 4.5} Td (${escapePdfText(s.value)}) Tj ET`);
            });
            tableTopY = boxY - 12;
        }

        // Draw Table Header
        const thY = tableTopY - headerRowH;
        cmds.push('0.125 0.220 0.502 rg');
        cmds.push(`${marginX} ${thY} ${usableW} ${headerRowH} re f`);

        let colX = marginX;
        normCols.forEach((col) => {
            cmds.push('BT /F2 8 Tf 1 1 1 rg');
            cmds.push(`${colX + 5} ${thY + 7.5} Td (${escapePdfText(col.header)}) Tj ET`);
            colX += col.ptWidth;
        });

        // Draw Table Rows
        let rowTopY = thY;
        if (pg.rows.length === 0) {
            const emptyH = 28;
            const ey = rowTopY - emptyH;
            cmds.push('0.859 0.890 0.941 RG 0.5 w');
            cmds.push(`${marginX} ${ey} ${usableW} ${emptyH} re S`);
            cmds.push('BT /F1 8.5 Tf 0.392 0.455 0.545 rg');
            cmds.push(`${marginX + 12} ${ey + 10} Td (Tidak ada data untuk ditampilkan.) Tj ET`);
        } else {
            pg.rows.forEach((r, rIdx) => {
                const ry = rowTopY - r.rowHeight;
                // Alternating background
                if (rIdx % 2 === 1) {
                    cmds.push('0.973 0.980 0.992 rg');
                    cmds.push(`${marginX} ${ry} ${usableW} ${r.rowHeight} re f`);
                }
                // Row border
                cmds.push('0.859 0.890 0.941 RG 0.5 w');
                cmds.push(`${marginX} ${ry} ${usableW} ${r.rowHeight} re S`);

                let cx = marginX;
                normCols.forEach((col, cIdx) => {
                    const lines = r.cellLines[cIdx] || ['-'];
                    lines.forEach((lineText, lIdx) => {
                        const textY = rowTopY - 11.5 - lIdx * 10.2;
                        cmds.push('BT');
                        cmds.push(cIdx === 0 ? '/F2 7.8 Tf 0.125 0.220 0.502 rg' : '/F1 7.8 Tf 0.118 0.161 0.231 rg');
                        cmds.push(`${cx + 5} ${textY.toFixed(2)} Td`);
                        cmds.push(`(${escapePdfText(lineText)}) Tj`);
                        cmds.push('ET');
                    });
                    cx += col.ptWidth;
                });

                rowTopY = ry;
            });
        }

        // Page Footer
        cmds.push('0.859 0.890 0.941 RG 0.6 w');
        cmds.push(`${marginX} 32 ${usableW} 0.5 re S`);

        cmds.push('BT /F1 7.5 Tf 0.392 0.455 0.545 rg');
        cmds.push(
            `${marginX} 20 Td (Ruang Alumni SMA Double Track — Laporan Resmi Panel Pengelola) Tj ET`
        );

        cmds.push('BT /F2 7.5 Tf 0.125 0.220 0.502 rg');
        cmds.push(
            `${pageW - marginX - 85} 20 Td (Halaman ${pageIdx + 1} dari ${totalPages}) Tj ET`
        );

        return cmds.join('\n');
    });

    // Assemble PDF 1.4 objects
    // Object 1: Catalog, Object 2: Pages, Object 3: Helvetica, Object 4: Helvetica-Bold
    // Objects 5..(4 + totalPages*2): Page & Content stream pairs
    const objects = [];
    const pageObjIds = [];

    for (let i = 0; i < totalPages; i++) {
        pageObjIds.push(5 + i * 2);
    }

    objects.push({
        id: 1,
        body: '<< /Type /Catalog /Pages 2 0 R >>',
    });

    objects.push({
        id: 2,
        body: `<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${totalPages} >>`,
    });

    objects.push({
        id: 3,
        body: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    });

    objects.push({
        id: 4,
        body: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    });

    pageStreams.forEach((streamStr, idx) => {
        const pageId = 5 + idx * 2;
        const contentId = pageId + 1;
        const streamBytes = enc.encode(streamStr);

        objects.push({
            id: pageId,
            body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
        });

        objects.push({
            id: contentId,
            body: `<< /Length ${streamBytes.length} >>\nstream\n${streamStr}\nendstream`,
        });
    });

    // Serialize PDF with xref table
    let pdfText = '%PDF-1.4\n';
    const offsets = [0];

    for (const obj of objects) {
        offsets[obj.id] = enc.encode(pdfText).length;
        pdfText += `${obj.id} 0 obj\n${obj.body}\nendobj\n`;
    }

    const xrefOffset = enc.encode(pdfText).length;
    const totalObjs = objects.length + 1;
    pdfText += `xref\n0 ${totalObjs}\n`;
    pdfText += '0000000000 65535 f \n';

    for (let i = 1; i < totalObjs; i++) {
        const off = String(offsets[i] || 0).padStart(10, '0');
        pdfText += `${off} 00000 n \n`;
    }

    pdfText += `trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    const pdfBlob = new Blob([enc.encode(pdfText)], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Open in new tab for instant PDF preview/printing AND trigger download
    const previewWin = window.open(pdfUrl, '_blank');
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (previewWin) {
        previewWin.focus();
    }

    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
}

/* ============================================================================
 * Pure Frontend OpenXML (.xlsx) Generator (Store ZIP + Workbook XML)
 * ========================================================================== */

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c >>> 0;
    }
    return table;
})();

function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
        c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
}

function buildZipArchive(files) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    for (const file of files) {
        const nameBytes = enc.encode(file.name);
        const dataBytes = enc.encode(file.content);
        const crc = crc32(dataBytes);
        const size = dataBytes.length;

        // Local file header (30 bytes + name)
        const lh = new Uint8Array(30 + nameBytes.length);
        const lView = new DataView(lh.buffer);
        lView.setUint32(0, 0x04034b50, true); // signature
        lView.setUint16(4, 20, true); // version needed
        lView.setUint16(6, 0x0800, true); // UTF-8 flag
        lView.setUint16(8, 0, true); // store (no compression)
        lView.setUint16(10, 0, true); // mod time
        lView.setUint16(12, 0x5978, true); // mod date
        lView.setUint32(14, crc, true);
        lView.setUint32(18, size, true);
        lView.setUint32(22, size, true);
        lView.setUint16(26, nameBytes.length, true);
        lView.setUint16(28, 0, true);
        lh.set(nameBytes, 30);

        localParts.push(lh, dataBytes);

        // Central directory file header (46 bytes + name)
        const ch = new Uint8Array(46 + nameBytes.length);
        const cView = new DataView(ch.buffer);
        cView.setUint32(0, 0x02014b50, true);
        cView.setUint16(4, 20, true);
        cView.setUint16(6, 20, true);
        cView.setUint16(8, 0x0800, true);
        cView.setUint16(10, 0, true);
        cView.setUint16(12, 0, true);
        cView.setUint16(14, 0x5978, true);
        cView.setUint32(16, crc, true);
        cView.setUint32(20, size, true);
        cView.setUint32(24, size, true);
        cView.setUint16(28, nameBytes.length, true);
        cView.setUint16(30, 0, true);
        cView.setUint16(32, 0, true);
        cView.setUint16(34, 0, true);
        cView.setUint16(36, 0, true);
        cView.setUint32(38, 0, true);
        cView.setUint32(42, offset, true);
        ch.set(nameBytes, 46);

        centralParts.push(ch);
        offset += lh.length + size;
    }

    const centralSize = centralParts.reduce((acc, p) => acc + p.length, 0);
    const eocd = new Uint8Array(22);
    const eView = new DataView(eocd.buffer);
    eView.setUint32(0, 0x06054b50, true);
    eView.setUint16(4, 0, true);
    eView.setUint16(6, 0, true);
    eView.setUint16(8, files.length, true);
    eView.setUint16(10, files.length, true);
    eView.setUint32(12, centralSize, true);
    eView.setUint32(16, offset, true);
    eView.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, eocd], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
}

function colIndexToLetter(index) {
    let letter = '';
    let temp = index;
    while (temp >= 0) {
        letter = String.fromCharCode((temp % 26) + 65) + letter;
        temp = Math.floor(temp / 26) - 1;
    }
    return letter;
}

/**
 * Generate & Download genuine Excel (.xlsx) workbook in Frontend
 * @param {Object} config
 * @param {string} config.title - Judul laporan di baris pertama
 * @param {string} config.sheetName - Nama sheet Excel
 * @param {string} config.filename - Nama file output tanpa ekstensi
 * @param {Array<{header: string, width?: number, accessor: (row: any, idx: number) => any}>} config.columns
 * @param {Array<any>} config.data
 */
export function exportToExcelFile({
    title = 'Laporan Ruang Alumni SMA Double Track',
    sheetName = 'Data Laporan',
    filename = 'Laporan-Double-Track',
    columns = [],
    data = [],
}) {
    const safeSheetName = escapeXml(sheetName.slice(0, 31));

    // Build column width definitions
    const colsXml = columns
        .map((c, idx) => {
            const charWidth = Math.max(12, Math.round((c.width || 110) / 5.5));
            return `<col min="${idx + 1}" max="${idx + 1}" width="${charWidth}" customWidth="1"/>`;
        })
        .join('');

    const rowsXml = [];

    // Row 1: Report Title
    rowsXml.push(
        `<row r="1" ht="24" customHeight="1"><c r="A1" t="inlineStr" s="1"><is><t>${escapeXml(
            title
        )}</t></is></c></row>`
    );

    // Row 2: Timestamp
    const nowStr = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date());
    rowsXml.push(
        `<row r="2" ht="18" customHeight="1"><c r="A2" t="inlineStr" s="4"><is><t>${escapeXml(
            `Dicetak pada: ${nowStr} • Total Data: ${data.length}`
        )}</t></is></c></row>`
    );

    // Row 4: Table Headers (Style 2 = Double Track Navy #203880 background, white bold text)
    const headerCells = columns
        .map((col, cIdx) => {
            const ref = `${colIndexToLetter(cIdx)}4`;
            return `<c r="${ref}" t="inlineStr" s="2"><is><t>${escapeXml(col.header)}</t></is></c>`;
        })
        .join('');
    rowsXml.push(`<row r="4" ht="22" customHeight="1">${headerCells}</row>`);

    // Rows 5..N: Data Rows (Style 3 = bordered cell)
    data.forEach((row, rIdx) => {
        const excelRowNum = rIdx + 5;
        const cells = columns
            .map((col, cIdx) => {
                const ref = `${colIndexToLetter(cIdx)}${excelRowNum}`;
                const val = col.accessor(row, rIdx);
                if (typeof val === 'number' && Number.isFinite(val)) {
                    return `<c r="${ref}" s="3"><v>${val}</v></c>`;
                }
                return `<c r="${ref}" t="inlineStr" s="3"><is><t>${escapeXml(val ?? '-')}</t></is></c>`;
            })
            .join('');
        rowsXml.push(`<row r="${excelRowNum}">${cells}</row>`);
    });

    const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>${colsXml}</cols>
  <sheetData>${rowsXml.join('')}</sheetData>
</worksheet>`;

    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="10"/><color rgb="FF1E293B"/><name val="Calibri"/></font>
    <font><b/><sz val="13"/><color rgb="FF203880"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><i/><sz val="9.5"/><color rgb="FF64748B"/><name val="Calibri"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF203880"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="5">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">
      <alignment vertical="top" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
</styleSheet>`;

    const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${safeSheetName}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

    const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

    const xlsxBlob = buildZipArchive([
        { name: '[Content_Types].xml', content: contentTypesXml },
        { name: '_rels/.rels', content: rootRelsXml },
        { name: 'xl/workbook.xml', content: workbookXml },
        { name: 'xl/_rels/workbook.xml.rels', content: workbookRelsXml },
        { name: 'xl/styles.xml', content: stylesXml },
        { name: 'xl/worksheets/sheet1.xml', content: sheetXml },
    ]);

    const url = URL.createObjectURL(xlsxBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/**
 * Generate & Cetak Berita Acara Serah Terima (BAST) Fasilitasi Ruang Modal (PDF Portrait A4)
 */
export function exportBastPdf(item, formatRupiahFn) {
    if (!item) return;

    const pageW = 595.28; // A4 Portrait width (pt)
    const pageH = 841.89; // A4 Portrait height (pt)
    const marginX = 42;
    const usableW = pageW - marginX * 2;

    const nomorBast = item.nomor_bast || `BAST/DT-RM/${new Date().getFullYear()}/${item.kode?.slice(-6) || '001'}`;
    const tglSalur = item.tanggal_penyaluran || new Date().toISOString().slice(0, 10);
    const nominalStr = formatRupiahFn
        ? formatRupiahFn(item.nominal_disetujui || item.estimasi_biaya || 0)
        : `Rp ${Number(item.nominal_disetujui || item.estimasi_biaya || 0).toLocaleString('id-ID')}`;

    const cmds = [];

    // Header Bar Navy & Amber
    cmds.push('0.125 0.220 0.502 rg');
    cmds.push(`${marginX} ${pageH - 36} ${usableW * 0.75} 6 re f`);
    cmds.push('0.973 0.627 0.000 rg');
    cmds.push(`${marginX + usableW * 0.75} ${pageH - 36} ${usableW * 0.25} 6 re f`);

    // Title
    cmds.push('BT /F2 13 Tf 0.125 0.220 0.502 rg');
    cmds.push(`${marginX} ${pageH - 58} Td (BERITA ACARA SERAH TERIMA (BAST) FASILITASI RUANG MODAL) Tj ET`);

    cmds.push('BT /F1 9 Tf 0.392 0.455 0.545 rg');
    cmds.push(
        `${marginX} ${pageH - 72} Td (Program Ruang Alumni SMA Double Track - Dinas Pendidikan Prov. Jawa Timur & ITS) Tj ET`
    );

    // Nomor BAST Box
    cmds.push('0.961 0.973 0.992 rg 0.859 0.890 0.941 RG 0.8 w');
    cmds.push(`${marginX} ${pageH - 114} ${usableW} 30 re B`);

    cmds.push('BT /F2 9.5 Tf 0.125 0.220 0.502 rg');
    cmds.push(`${marginX + 10} ${pageH - 97} Td (Nomor BAST: ${escapePdfText(nomorBast)}) Tj ET`);
    cmds.push('BT /F1 8.5 Tf 0.118 0.161 0.231 rg');
    cmds.push(
        `${marginX + 10} ${pageH - 109} Td (Kode Pengajuan: ${escapePdfText(item.kode)}   |   Tanggal Penyaluran: ${escapePdfText(tglSalur)}   |   Status: ${escapePdfText(item.status_seleksi)}) Tj ET`
    );

    let y = pageH - 138;

    const drawSectionHeader = (label) => {
        cmds.push('0.125 0.220 0.502 rg');
        cmds.push(`${marginX} ${y - 4} ${usableW} 18 re f`);
        cmds.push('BT /F2 8.5 Tf 1 1 1 rg');
        cmds.push(`${marginX + 8} ${y + 1.5} Td (${escapePdfText(label)}) Tj ET`);
        y -= 22;
    };

    const drawKeyVal = (key, val) => {
        cmds.push('BT /F2 8.5 Tf 0.278 0.333 0.412 rg');
        cmds.push(`${marginX + 6} ${y} Td (${escapePdfText(key)}) Tj ET`);
        const wrapped = wrapText(val || '-', 66);
        wrapped.forEach((line, idx) => {
            cmds.push('BT /F1 8.5 Tf 0.118 0.161 0.231 rg');
            cmds.push(`${marginX + 165} ${y - idx * 12} Td (:  ${escapePdfText(line)}) Tj ET`);
        });
        y -= Math.max(15, wrapped.length * 12 + 3);
    };

    drawSectionHeader('I. IDENTITAS ALUMNI PENERIMA FASILITASI');
    drawKeyVal('Nama Lengkap Alumni', item.nama);
    drawKeyVal('Asal Sekolah & Tahun Lulus', `${item.sekolah} (Lulusan ${item.tahun_lulus})`);
    drawKeyVal('Kompetensi Double Track', item.kompetensi);
    drawKeyVal('Kontak (WhatsApp / Email)', `${item.whatsapp || '-'} / ${item.email || '-'}`);
    drawKeyVal('Guru Pendamping Sekolah', item.guru_pendamping || '-');

    y -= 8;
    drawSectionHeader('II. HASIL SELEKSI & RUBRIK KELAYAKAN');
    drawKeyVal('Jalur & Jenis Bantuan', `Ruang Modal ${item.jalur} - ${item.jenis_bantuan}`);
    drawKeyVal(
        'Nilai Akhir Rubrik Seleksi',
        item.skor_total != null
            ? `${item.skor_total} / 100 (Kompetensi:${item.skor_kompetensi || 0}, Rencana:${item.skor_rencana || 0}, Alat:${item.skor_kebutuhan || 0}, Dampak:${item.skor_dampak || 0}, Komitmen:${item.skor_komitmen || 0})`
            : 'Terverifikasi oleh Tim Seleksi'
    );
    drawKeyVal('Peninjau / Verifikator', item.reviewer?.name || 'Tim Seleksi Ruang Modal');
    drawKeyVal('Catatan Verifikasi', item.catatan_admin || 'Layak menerima fasilitasi bantuan produktif.');

    y -= 8;
    drawSectionHeader('III. RINCIAN BARANG / MODAL PRODUKTIF YANG DISALURKAN');
    drawKeyVal('Nilai Bantuan Disetujui', nominalStr);
    drawKeyVal(
        'Rincian Alat / Modal Disalurkan',
        item.rincian_bantuan_disalurkan || item.rincian_kebutuhan
    );
    drawKeyVal('Rencana & Target Produktif', item.rencana_deskripsi);

    y -= 8;
    drawSectionHeader('IV. PERNYATAAN KOMITMEN PENERIMA BANTUAN');
    const komitmenLines = [
        '1. Penerima menyatakan telah menerima fasilitasi peralatan kerja / modal usaha dalam kondisi baik dan sesuai.',
        '2. Bantuan wajib dimanfaatkan secara produktif sesuai rencana kerja/usaha dan tidak diperjualbelikan.',
        '3. Penerima berkomitmen mengikuti pendampingan dan melaporkan perkembangan usaha/omzet selama minimal 6 bulan.',
    ];
    komitmenLines.forEach((line) => {
        cmds.push('BT /F1 8 Tf 0.118 0.161 0.231 rg');
        cmds.push(`${marginX + 8} ${y} Td (${escapePdfText(line)}) Tj ET`);
        y -= 13;
    });

    // Signature Boxes
    y -= 28;
    cmds.push('BT /F2 8.5 Tf 0.125 0.220 0.502 rg');
    cmds.push(`${marginX + 20} ${y} Td (PIHAK PERTAMA (PENGELOLA PROGRAM)) Tj ET`);
    cmds.push('BT /F2 8.5 Tf 0.125 0.220 0.502 rg');
    cmds.push(`${marginX + 300} ${y} Td (PIHAK KEDUA (ALUMNI PENERIMA)) Tj ET`);

    y -= 55;
    cmds.push('BT /F2 8.5 Tf 0.118 0.161 0.231 rg');
    cmds.push(
        `${marginX + 20} ${y} Td (( ${escapePdfText(item.reviewer?.name || 'Koordinator Ruang Modal DT')} )) Tj ET`
    );
    cmds.push('BT /F2 8.5 Tf 0.118 0.161 0.231 rg');
    cmds.push(`${marginX + 300} ${y} Td (( ${escapePdfText(item.nama)} )) Tj ET`);

    // Footer
    cmds.push('0.859 0.890 0.941 RG 0.6 w');
    cmds.push(`${marginX} 32 ${usableW} 0.5 re S`);
    cmds.push('BT /F1 7.5 Tf 0.392 0.455 0.545 rg');
    cmds.push(
        `${marginX} 20 Td (Dokumen Resmi BAST Ruang Modal SMA Double Track - Dicetak otomatis dari Sistem Ruang Alumni) Tj ET`
    );

    const streamStr = cmds.join('\n');
    const streamBytes = enc.encode(streamStr);

    const objects = [
        { id: 1, body: '<< /Type /Catalog /Pages 2 0 R >>' },
        { id: 2, body: '<< /Type /Pages /Kids [5 0 R] /Count 1 >>' },
        {
            id: 3,
            body: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
        },
        {
            id: 4,
            body: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
        },
        {
            id: 5,
            body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 6 0 R >>`,
        },
        {
            id: 6,
            body: `<< /Length ${streamBytes.length} >>\nstream\n${streamStr}\nendstream`,
        },
    ];

    let pdfText = '%PDF-1.4\n';
    const offsets = [0];
    for (const obj of objects) {
        offsets[obj.id] = enc.encode(pdfText).length;
        pdfText += `${obj.id} 0 obj\n${obj.body}\nendobj\n`;
    }
    const xrefOffset = enc.encode(pdfText).length;
    const totalObjs = objects.length + 1;
    pdfText += `xref\n0 ${totalObjs}\n0000000000 65535 f \n`;
    for (let i = 1; i < totalObjs; i++) {
        pdfText += `${String(offsets[i] || 0).padStart(10, '0')} 00000 n \n`;
    }
    pdfText += `trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    const pdfBlob = new Blob([enc.encode(pdfText)], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const previewWin = window.open(pdfUrl, '_blank');
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `BAST-${item.kode}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (previewWin) previewWin.focus();
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
}
