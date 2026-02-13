import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
    fileName: string;
    charCount: number;
    tokenCount: number;
    isExact: boolean;
}

interface OverallStats {
    totalTokens: number;
    totalChars: number;
}

const COLORS = [
    [59, 130, 246], // Blue-500
    [239, 68, 68],  // Red-500
    [16, 185, 129], // Emerald-500
    [245, 158, 11], // Amber-500
    [139, 92, 246], // Violet-500
    [236, 72, 153]  // Pink-500
];

export const generatePDFReport = (files: ReportData[], overallStats: OverallStats) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- Header Section ---
    doc.setFillColor(30, 41, 59); // zinc-800
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Tokenator Report", 14, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

    let yPos = 55;

    // --- Summary Stats ---
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Analysis Summary", 14, yPos);
    yPos += 10;

    // Card Background
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14, yPos, pageWidth - 28, 35, 3, 3, 'FD');
    yPos += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const col1 = 20, col2 = 80, col3 = 140;

    doc.text("Total Files", col1, yPos);
    doc.text("Total Tokens", col2, yPos);
    doc.text("Total Characters", col3, yPos);
    yPos += 8;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235); // blue-600

    doc.text(files.length.toString(), col1, yPos);
    doc.text(overallStats.totalTokens.toLocaleString(), col2, yPos);
    doc.text(overallStats.totalChars.toLocaleString(), col3, yPos);
    yPos += 25;

    // --- 1. Context Window Usage (Progress Bar) ---
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Context Window Usage (1M Limit)", 14, yPos);

    const usagePercent = overallStats.totalTokens / 1000000;

    // Draw Track
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, yPos + 5, pageWidth - 28, 10, 2, 2, 'F');

    // Draw Progress
    const barWidth = (pageWidth - 28) * Math.min(usagePercent, 1);
    doc.setFillColor(usagePercent > 1 ? 239 : 37, usagePercent > 1 ? 68 : 99, usagePercent > 1 ? 68 : 235);
    doc.roundedRect(14, yPos + 5, barWidth, 10, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`${(usagePercent * 100).toFixed(2)}% Used`, 14, yPos + 22);
    yPos += 35;

    // --- 2. Token Distribution (Stacked Bar) ---
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Token Distribution (Share per File)", 14, yPos);

    const sortedFiles = [...files].sort((a, b) => b.tokenCount - a.tokenCount);
    const top5 = sortedFiles.slice(0, 5);
    const others = sortedFiles.slice(5);
    const othersCount = others.reduce((acc, curr) => acc + curr.tokenCount, 0);

    const pieData = [...top5];
    if (othersCount > 0) {
        pieData.push({ fileName: "Others", tokenCount: othersCount, charCount: 0, isExact: false });
    }

    const total = overallStats.totalTokens || 1;
    let currentX = 14;
    const chartWidth = pageWidth - 28;
    const chartHeight = 15;

    // Draw Stacked Bar
    pieData.forEach((item, index) => {
        const color = COLORS[index % COLORS.length];
        const width = (item.tokenCount / total) * chartWidth;

        if (width > 0.5) {
            doc.setFillColor(color[0], color[1], color[2]);
            doc.rect(currentX, yPos + 10, width, chartHeight, 'F');
            currentX += width;
        }
    });

    // Legend
    let legendX = 14;
    let legendY = yPos + 32;

    pieData.forEach((item, index) => {
        const color = COLORS[index % COLORS.length];
        const percent = ((item.tokenCount / total) * 100).toFixed(1);

        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(legendX, legendY, 3, 3, 'F');

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);

        const label = `${item.fileName.substring(0, 10)}${item.fileName.length > 10 ? '..' : ''} ${percent}%`;
        const labelWidth = doc.getTextWidth(label) + 8;

        if (legendX + labelWidth > pageWidth - 14) {
            legendX = 14;
            legendY += 5;
        }

        doc.text(label, legendX + 5, legendY + 2.5);
        legendX += labelWidth;
    });

    yPos += 45 + (legendY - (yPos + 32));

    // --- 3. File Comparison (Bar Chart) ---
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("File Comparison (Tokens vs Characters)", 14, yPos);
    yPos += 10;

    const maxVal = Math.max(...files.map(f => Math.max(f.tokenCount, f.charCount)), 1);
    const compChartH = 40;
    const compChartW = pageWidth - 28;

    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos + compChartH, 14 + compChartW, yPos + compChartH);

    const barAreaW = compChartW / (files.slice(0, 10).length || 1);
    const barW = Math.min(8, barAreaW * 0.35);
    const gap = 1;

    files.slice(0, 10).forEach((file, i) => {
        const xCenter = 14 + (i * barAreaW) + (barAreaW / 2);

        const hTok = (file.tokenCount / maxVal) * compChartH;
        const hChar = (file.charCount / maxVal) * compChartH;

        const yBase = yPos + compChartH;

        doc.setFillColor(59, 130, 246); // Blue
        doc.rect(xCenter - barW - gap, yBase - hTok, barW, hTok, 'F');

        doc.setFillColor(16, 185, 129); // Emerald
        doc.rect(xCenter + gap, yBase - hChar, barW, hChar, 'F');

        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        const name = file.fileName.length > 6 ? file.fileName.substring(0, 5) + '.' : file.fileName;
        doc.text(name, xCenter, yBase + 4, { align: 'center' });
    });

    yPos += compChartH + 15;

    // --- Table (Without Method) ---
    const tableData = files.map(file => [
        file.fileName,
        file.charCount.toLocaleString(),
        file.tokenCount.toLocaleString()
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [["File Name", "Characters", "Tokens"]],
        body: tableData,
        theme: 'grid',
        styles: {
            font: "helvetica",
            fontSize: 9,
            cellPadding: 4,
        },
        headStyles: {
            fillColor: [30, 41, 59],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [241, 245, 249]
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { halign: 'right' },
            2: { halign: 'right', fontStyle: 'bold', textColor: [37, 99, 235] }
        }
    });

    // --- Footer ---
    const pageCount = doc.internal.pages.length - 1;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: "right" });
        doc.text("Generated by Tokenator", 14, pageHeight - 10);
    }

    doc.save("tokenator_report.pdf");
};
