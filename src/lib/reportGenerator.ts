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

export const generatePDFReport = (files: ReportData[], overallStats: OverallStats) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header Background
    doc.setFillColor(30, 41, 59); // zinc-800 equivalent
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Tokenator Report", 14, 25);

    // Subtitle/Date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 200);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

    // Stats Cards Section
    let yPos = 55;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Analysis Summary", 14, yPos);

    yPos += 10;

    // Draw summary box
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14, yPos, pageWidth - 28, 35, 3, 3, 'FD');

    yPos += 12;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Columns for stats
    const col1 = 20;
    const col2 = 80;
    const col3 = 140;

    doc.text("Total Files", col1, yPos);
    doc.text("Total Tokens", col2, yPos);
    doc.text("Total Characters", col3, yPos);

    yPos += 8;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235); // blue-600

    // ... (previous code) ...

    doc.text(files.length.toString(), col1, yPos);
    doc.text(overallStats.totalTokens.toLocaleString(), col2, yPos);
    doc.text(overallStats.totalChars.toLocaleString(), col3, yPos);

    yPos += 20;

    // --- PDF Charts (Manually drawn) ---

    // 1. Context Window Usage (Pie/Donut)
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Context Window Usage", 14, yPos);

    const usagePercent = overallStats.totalTokens / 1000000;
    const pieX = 50;
    const pieY = yPos + 35;
    const radius = 25;

    // Background Circle (Gray)
    doc.setFillColor(226, 232, 240);
    doc.circle(pieX, pieY, radius, 'F');

    // Usage wedge
    if (usagePercent > 0) {
        doc.setFillColor(37, 99, 235); // Blue
        // Simplified wedge drawing for PDF (using lines for approximation if sector not supported well in all versions, but let's try to simulate)
        // Since jsPDF doesn't have a simple sector command in standard build without adding plugins, we'll draw angles.
        // Actually, let's stick to a simple bar for "Usage" to be safe and robust, and a Pie for file distribution if possible.
        // Drawing a real pie chart in raw jsPDF is complex without plugins. 
        // Let's implement a nice "Progress Bar" for Context Window and a Bar Chart for Files.
    }

    // REVISED PLAN: Better visuals that are robust in jsPDF core.

    // A. Context Window Progress Bar (Visual)
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, yPos + 5, pageWidth - 28, 10, 2, 2, 'F'); // Track

    const barWidth = (pageWidth - 28) * Math.min(usagePercent, 1);
    doc.setFillColor(usagePercent > 1 ? 239 : 37, usagePercent > 1 ? 68 : 99, usagePercent > 1 ? 68 : 235); // Red if > 100%, else Blue
    doc.roundedRect(14, yPos + 5, barWidth, 10, 2, 2, 'F'); // Progress

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`${(usagePercent * 100).toFixed(2)}% of 1,000,000 Tokens`, 14, yPos + 22);

    yPos += 40;

    // B. File Token Distribution (Bar Chart)
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Top Files by Token Count", 14, yPos);
    yPos += 10;

    const maxTokens = Math.max(...files.map(f => f.tokenCount), 1);
    const chartHeight = 60;
    const chartWidth = pageWidth - 40;
    const barMaxHeight = 50;

    // Sort files by tokens for the chart (top 5)
    const topFiles = [...files].sort((a, b) => b.tokenCount - a.tokenCount).slice(0, 5);
    const barStep = chartWidth / (topFiles.length || 1);
    const barW = Math.min(30, barStep - 10);

    topFiles.forEach((file, i) => {
        const h = (file.tokenCount / maxTokens) * barMaxHeight;
        const x = 20 + i * barStep;
        const y = yPos + barMaxHeight - h;

        // Bar
        doc.setFillColor(59, 130, 246); // Blue-500
        doc.rect(x, y, barW, h, 'F');

        // Label
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const name = file.fileName.length > 8 ? file.fileName.substring(0, 6) + '..' : file.fileName;
        doc.text(name, x + barW / 2, yPos + barMaxHeight + 5, { align: 'center' });
        doc.text(file.tokenCount.toLocaleString(), x + barW / 2, y - 2, { align: 'center' });
    });

    yPos += chartHeight + 10;

    // Table
    const tableData = files.map(file => [
        file.fileName,
        file.charCount.toLocaleString(),
        file.tokenCount.toLocaleString(),
        file.isExact ? "Verified (API)" : "Estimated"
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [["File Name", "Characters", "Tokens", "Method"]],
        body: tableData,
        theme: 'grid',
        styles: {
            font: "helvetica",
            fontSize: 10,
            cellPadding: 5,
        },
        headStyles: {
            fillColor: [30, 41, 59], // Dark header
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [241, 245, 249] // slate-100
        },
        columnStyles: {
            0: { cellWidth: 'auto' }, // File Name
            1: { halign: 'right' },   // Chars
            2: { halign: 'right', fontStyle: 'bold', textColor: [37, 99, 235] },   // Tokens
            3: { halign: 'center' }   // Method
        }
    });

    // Footer
    const pageCount = doc.internal.pages.length - 1; // jspdf starts with 1 page
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: "right" });
        doc.text("Generated by Tokenator", 14, 285);
    }

    doc.save("tokenator_report.pdf");
};
