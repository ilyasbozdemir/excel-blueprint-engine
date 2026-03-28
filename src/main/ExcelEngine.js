const ExcelJS = require('exceljs');
const fs = require('fs');

class ExcelEngine {

    /**
     * Varsayılan bir şablon yapısı inşa eder (Generic Snapshot).
     */
    static buildGenericTemplateHeader(worksheet) {
        worksheet.mergeCells('A1:V1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'GENEL RAPORLAMA ŞABLONU';
        titleCell.font = { name: 'Arial', size: 16, bold: true };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        const headers = [
            { range: 'A2:A3', text: 'Sıra' },
            { range: 'B2:B3', text: 'Kod / ID' },
            { range: 'C2:C3', text: 'Açıklama / İsim' },
            { range: 'D2:D3', text: 'Sütun 1' },
            { range: 'E2:E3', text: 'Sütun 2' },
            { range: 'F2:F3', text: 'Sütun 3' },
            { range: 'G2:G3', text: 'Sütun 4' }
        ];

        headers.forEach(h => {
             // ...
        });

        worksheet.getRow(2).height = 30;
        worksheet.getRow(3).height = 30;
    }


    /**
     * PROFESYONEL: Sayfa Düzeni ve Dinamik Sınır Algılamalı Analizör
     */
    static async extractTemplateToCode(filePath, headerRows = 3) {
        try {
            const workbook = new ExcelJS.Workbook();
            if (!fs.existsSync(filePath)) throw new Error("Dosya bulunamadı.");
            
            await workbook.xlsx.readFile(filePath);
            const worksheet = workbook.getWorksheet(1);
            
            // 1. DİNAMİK SINIRLARI BUL (Son çizgili/stilli satırı bul)
            let lastFormattedRow = 0;
            worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                let hasS = false;
                row.eachCell({ includeEmpty: true }, (cell) => {
                    if (this.hasStyle(cell)) hasS = true;
                });
                if (hasS) lastFormattedRow = rowNumber;
            });
            if (lastFormattedRow === 0) lastFormattedRow = 40; // Fallback

            const lastCol = worksheet.actualColumnCount;
            const maxCols = Math.max(lastCol, 22);
            
            let codeLines = [];
            let headerCode = [];
            let bodyLoopCode = [];

            codeLines.push("// --- EXCELJS DYNAMIC PATTERN CODE ---");
            codeLines.push("const workbook = new ExcelJS.Workbook(); const worksheet = workbook.addWorksheet('Sheet1');");

            // 2. SAYFA DÜZENİ (Yatay/Dikey Algılama)
            if (worksheet.pageSetup) {
                codeLines.push(`worksheet.pageSetup = ${JSON.stringify(worksheet.pageSetup)};`);
            }

            // 3. SÜTUN GENİŞLİKLERİ
            for (let i = 1; i <= maxCols; i++) {
                const col = worksheet.getColumn(i);
                if (col.width && Math.abs(col.width - 8.43) > 1) {
                    codeLines.push(`worksheet.getColumn(${i}).width = ${col.width};`);
                }
            }

            // 4. MERGED AREAS
            if (worksheet.model && worksheet.model.merges) {
                worksheet.model.merges.forEach(m => codeLines.push(`worksheet.mergeCells('${m}');`));
            }

            // 5. BAŞLIK SATIRLARI
            for (let r = 1; r <= headerRows; r++) {
                const row = worksheet.getRow(r);
                if (row.height > 15) headerCode.push(`worksheet.getRow(${r}).height = ${row.height};`);
                for (let c = 1; c <= maxCols; c++) {
                    const cell = row.getCell(c);
                    if (!cell.value && !this.hasStyle(cell)) continue;
                    headerCode.push(this.generateCellCode(cell, r));
                }
            }

            // 6. GÖVDE DÖNGÜSÜ (Dinamik Sınır: lastFormattedRow)
            const templateRowIdx = parseInt(headerRows) + 1;
            const templateRow = worksheet.getRow(templateRowIdx);
            
            if (templateRow) {
                bodyLoopCode.push(`\n// Gövde Döngüsü (Satır ${templateRowIdx}'den ${lastFormattedRow}'e kadar otomatik taklit)`);
                bodyLoopCode.push(`for (let r = ${templateRowIdx}; r <= ${lastFormattedRow}; r++) {`);
                bodyLoopCode.push(`  const row = worksheet.getRow(r);`);
                if (templateRow.height > 15) bodyLoopCode.push(`  row.height = ${templateRow.height};`);

                for (let c = 1; c <= maxCols; c++) {
                    const cell = templateRow.getCell(c);
                    if (!cell.value && !this.hasStyle(cell)) continue;
                    
                    bodyLoopCode.push(`  {`);
                    bodyLoopCode.push(`    const c = row.getCell(${c});`);
                    const val = cell.value;
                    if (val) {
                        if (val.formula) {
                            let formula = JSON.stringify(val.formula).replace(new RegExp(`${templateRowIdx}`, 'g'), '${r}');
                            bodyLoopCode.push(`    c.value = { formula: \`${formula.slice(1, -1)}\` };`);
                        } else {
                            bodyLoopCode.push(`    c.value = ${JSON.stringify(val)};`);
                        }
                    }
                    if (cell.font) bodyLoopCode.push(`    c.font = ${JSON.stringify(cell.font)};`);
                    if (cell.alignment) bodyLoopCode.push(`    c.alignment = ${JSON.stringify(cell.alignment)};`);
                    if (cell.border) bodyLoopCode.push(`    c.border = ${JSON.stringify(cell.border)};`);
                    if (cell.fill) bodyLoopCode.push(`    c.fill = ${JSON.stringify(cell.fill)};`);
                    if (cell.numFmt) bodyLoopCode.push(`    c.numFmt = ${JSON.stringify(cell.numFmt)};`);
                    bodyLoopCode.push(`  }`);
                }
                bodyLoopCode.push(`}`);
            }

            return codeLines.join('\n') + "\n" + headerCode.join('\n') + bodyLoopCode.join('\n');

        } catch (error) {
            throw new Error("Analiz Hatası: " + error.message);
        }
    }

    static hasStyle(cell) {
        return cell.font || cell.alignment || (cell.border && Object.keys(cell.border).length > 0) || cell.fill || cell.numFmt;
    }

    static generateCellCode(cell, r) {
        const addr = cell.address;
        const val = cell.value;
        let lines = [`const c${addr}=worksheet.getCell('${addr}');`];
        
        if (val !== null && val !== undefined) {
            let valueStr = (typeof val === 'object') ? JSON.stringify(val) : 
                           (typeof val === 'string') ? `'${val.replace(/'/g, "\\'").replace(/\n/g, "\\n")}'` : val;
            lines.push(`c${addr}.value=${valueStr};`);
        }
        if (cell.font) lines.push(`c${addr}.font=${JSON.stringify(cell.font)};`);
        if (cell.alignment) lines.push(`c${addr}.alignment=${JSON.stringify(cell.alignment)};`);
        if (cell.border) lines.push(`c${addr}.border=${JSON.stringify(cell.border)};`);
        if (cell.fill) lines.push(`c${addr}.fill=${JSON.stringify(cell.fill)};`);
        if (cell.numFmt) lines.push(`c${addr}.numFmt=${JSON.stringify(cell.numFmt)};`);
        return lines.join(' ');
    }





    /**
     * Hibrit Veri Doldurucu (Sütun Eşleşmeli VEYA Hücre Bazlı)
     */
    static async fill(inputPath, outputPath, options) {
        const { sheetName = 1, startRow = 4, dataMatrix, columnArray, includeHeader = false } = options;
        const workbook = new ExcelJS.Workbook();
        
        if (inputPath && fs.existsSync(inputPath)) {
            await workbook.xlsx.readFile(inputPath);
        } else {
            workbook.addWorksheet('Sheet1');
        }

        const worksheet = workbook.getWorksheet(sheetName) || workbook.getWorksheet(1);
        if (includeHeader) ExcelEngine.buildGenericTemplateHeader(worksheet);


        if (dataMatrix && Array.isArray(dataMatrix)) {
            dataMatrix.forEach((rowData, rIdx) => {
                const rowNum = parseInt(startRow) + rIdx;
                const row = worksheet.getRow(rowNum);

                // Eğer veri bir OBJE ise (örn: {"A5": "Test"})
                if (!Array.isArray(rowData) && typeof rowData === 'object') {
                    Object.keys(rowData).forEach(cellAddr => {
                        worksheet.getCell(cellAddr).value = rowData[cellAddr];
                    });
                } 
                // Eğer veri bir ARRAY ise (Klasik Matris - Sütun Eşleşmeli)
                else if (Array.isArray(rowData)) {
                    rowData.forEach((val, cIdx) => {
                        const colKey = (columnArray && columnArray[cIdx]) ? columnArray[cIdx] : (cIdx + 1);
                        const cell = row.getCell(colKey);
                        if (val === null || val === undefined || val === "" || (cell.value && cell.value.formula)) return;
                        cell.value = val;
                    });
                }
                row.commit();
            });
        }
        await workbook.xlsx.writeFile(outputPath);
        return outputPath;
    }


    /**
     * Üretilen Kodu Yürütüp Excel Dosyası Oluşturur
     */
    static async executeTemplateCode(codeString, outputPath) {
        const ExcelJS = require('exceljs');
        const runFunc = new Function('ExcelJS', `
            return (async () => {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Sheet1');
                ${codeString.replace(/const workbook = new ExcelJS\.Workbook\(\); const worksheet = workbook\.addWorksheet\('Sheet1'\);/, "")}
                return workbook;
            })();
        `);

        try {
            const workbook = await runFunc(ExcelJS);
            await workbook.xlsx.writeFile(outputPath);
            return true;
        } catch (error) {
            console.error("Code Execution Error:", error);
            throw new Error("Kod yürütülürken hata oluştu: " + error.message);
        }
    }
}


module.exports = ExcelEngine;
