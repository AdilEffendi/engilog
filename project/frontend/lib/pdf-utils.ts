import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateItemsPDF = (items: any[]) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Header Stylings
    const primaryColor = [79, 70, 229]; // Indigo-600
    const slateColor = [100, 116, 139]; // Slate-500
    const lightSlate = [248, 250, 252]; // Slate-50

    // Statistics Calculation
    const totalItems = items.length;
    const normalItems = items.filter(i => i.statusMesin === 'Normal').length;
    const maintenanceItems = items.filter(i => i.statusMesin === 'Maintenance').length;
    const rusakItems = items.filter(i => i.statusMesin === 'Rusak' || i.statusMesin === 'Critical').length;

    // Add Title & Branding
    doc.setFontSize(24);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text('Engineering', 14, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
    doc.text('Laporan Inventaris Item & Status Mesin', 14, 24);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 283, 24, { align: 'right' });

    // Summary Section (Modern Boxes)
    const summaryY = 32;
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.1);

    // Total Box
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.roundedRect(14, summaryY, 40, 15, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
    doc.text("TOTAL ITEM", 18, summaryY + 5);
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(totalItems.toString(), 18, summaryY + 11);

    // Normal Box
    doc.setFillColor(236, 253, 245); // Emerald-50
    doc.roundedRect(58, summaryY, 40, 15, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(5, 150, 105); // Emerald-600
    doc.text("NORMAL", 62, summaryY + 5);
    doc.setFontSize(12);
    doc.text(normalItems.toString(), 62, summaryY + 11);

    // Maintenance Box
    doc.setFillColor(255, 251, 235); // Amber-50
    doc.roundedRect(102, summaryY, 40, 15, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9); // Amber-700
    doc.text("MAINTENANCE", 106, summaryY + 5);
    doc.setFontSize(12);
    doc.text(maintenanceItems.toString(), 106, summaryY + 11);

    // Rusak Box
    doc.setFillColor(254, 242, 242); // Red-50
    doc.roundedRect(146, summaryY, 40, 15, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(220, 38, 38); // Red-600
    doc.text("RUSAK/KRITIS", 150, summaryY + 5);
    doc.setFontSize(12);
    doc.text(rusakItems.toString(), 150, summaryY + 11);

    // Prepare Table Data
    const tableColumn = ["No", "Nama Item", "Qty", "ID Asset", "Brand / Model", "S/N", "Kategori", "Status", "Kondisi", "Lantai"];
    const tableRows = items.map((item, index) => [
        index + 1,
        item.name,
        item.quantity || '1',
        item.assetId || '-',
        `${item.brand || '-'} / ${item.model || '-'}`,
        item.serialNumber || '-',
        item.category || '-',
        item.statusMesin || '-',
        item.kondisiFisik || '-',
        `Lantai ${item.floor || '1'}`
    ]);

    // Render Table
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor as [number, number, number],
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            fontSize: 7.5,
            cellPadding: 2.5,
            overflow: 'linebreak'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 45 },
            2: { halign: 'center', cellWidth: 12 },
            3: { cellWidth: 25 },
            4: { cellWidth: 40 },
            5: { cellWidth: 30 },
            7: { halign: 'center', cellWidth: 28 },
            8: { cellWidth: 22 },
            9: { halign: 'center', cellWidth: 18 }
        },
        alternateRowStyles: {
            fillColor: lightSlate as [number, number, number]
        },
        didDrawPage: (data) => {
            // Footer
            const str = "Halaman " + doc.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.text(str, data.settings.margin.left, pageHeight - 10);
            doc.text(`Laporan Teknis Engineering - Terpercaya & Akurat`, 283, pageHeight - 10, { align: 'right' });
        }
    });

    // Save PDF
    doc.save(`Laporan_Engineering_${Date.now()}.pdf`);
};

export const generateItemDetailPDF = (item: any) => {
    const doc = new jsPDF('p', 'mm', 'a4'); // Portrait for detail view

    // Colors
    const primaryColor = [79, 70, 229]; // Indigo-600
    const slateColor = [100, 116, 139]; // Slate-500
    const lightSlate = [248, 250, 252]; // Slate-50
    const darkText = [15, 23, 42];      // Slate-900

    // --- HEADER ---
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text('Engineering', 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
    doc.text('Laporan Detail Aset & Riwayat', 14, 26);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 196, 26, { align: 'right' });

    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.line(14, 30, 196, 30);

    // --- ITEM IDENTITY (Left Column) ---
    let y = 40;
    doc.setFontSize(14);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.setFont("helvetica", "bold");
    doc.text(item.name, 14, y);

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
    doc.setFont("helvetica", "normal");
    doc.text(`ID Asset: ${item.assetId || '-'}`, 14, y);

    y += 5;
    doc.text(`Kategori: ${item.category || '-'}`, 14, y);

    // --- STATUS BOXES (Right Column) ---
    // Status Mesin
    const statusX = 140;
    let statusY = 38;

    // Helper for status badge
    const drawBadge = (label: string, value: string, color: [number, number, number], bgColor: [number, number, number], yPos: number) => {
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.roundedRect(statusX, yPos, 56, 14, 2, 2, 'F');
        doc.setFontSize(8);
        doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
        doc.text(label, statusX + 4, yPos + 5);
        doc.setFontSize(10);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont("helvetica", "bold");
        doc.text(value || '-', statusX + 4, yPos + 10);
    };

    drawBadge("Status Mesin", item.statusMesin, item.statusMesin === 'Normal' ? [5, 150, 105] : [220, 38, 38], [241, 245, 249], statusY);
    drawBadge("Kondisi Fisik", item.kondisiFisik, [79, 70, 229], [238, 242, 255], statusY + 16);

    // --- SPECIFICATIONS TABLE ---
    y += 25; // Move down
    autoTable(doc, {
        startY: y,
        head: [['Spesifikasi', 'Detail']],
        body: [
            ['Brand / Merk', item.brand || '-'],
            ['Model', item.model || '-'],
            ['Serial Number', item.serialNumber || '-'],
            ['Lokasi', `Lantai ${item.floor || '1'} - ${item.location || '-'}`],
            ['Kuantitas', `${item.quantity || 0} Unit`],
            ['Jam Operasional', `${item.jamOperasional || '-'} Jam`],
            ['Prioritas', item.tingkatPrioritas || '-'],
            ['Deskripsi', item.description || '-']
        ],
        theme: 'striped',
        headStyles: { fillColor: primaryColor as [number, number, number] },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } },
        margin: { top: 10, left: 14, right: 14 }
    });

    // Capture Y after specs table
    let finalY = (doc as any).lastAutoTable.finalY + 10;

    // --- MAINTENANCE HISTORY ---
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text('Riwayat Perbaikan (Maintenance)', 14, finalY);

    const maintenanceRows = (item.maintenanceRecords || []).map((rec: any) => [
        new Date(rec.tanggalKerusakan).toLocaleDateString('id-ID'),
        rec.penyebab || '-',
        rec.tindakan || '-',
        rec.teknisi || '-',
        rec.kondisiAkhir || '-'
    ]);

    if (maintenanceRows.length > 0) {
        autoTable(doc, {
            startY: finalY + 4,
            head: [['Tanggal', 'Masalah', 'Tindakan', 'Teknisi', 'Hasil']],
            body: maintenanceRows,
            theme: 'striped',
            headStyles: { fillColor: slateColor as [number, number, number] },
            styles: { fontSize: 8, cellPadding: 2 },
            margin: { left: 14, right: 14 }
        });
        finalY = (doc as any).lastAutoTable.finalY + 10;
    } else {
        doc.setFontSize(10);
        doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
        doc.setFont("helvetica", "italic");
        doc.text('Belum ada riwayat perbaikan.', 14, finalY + 8);
        finalY += 15;
    }

    // --- LOAN HISTORY ---
    // Check if we need a new page
    if (finalY > 250) {
        doc.addPage();
        finalY = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text('Riwayat Peminjaman', 14, finalY);

    const loanRows = (item.loanRecords || []).map((rec: any) => [
        new Date(rec.borrowDate).toLocaleDateString('id-ID'),
        rec.borrowerName || '-',
        rec.department || '-',
        rec.returnDate ? new Date(rec.returnDate).toLocaleDateString('id-ID') : 'Sedang Dipinjam'
    ]);

    if (loanRows.length > 0) {
        autoTable(doc, {
            startY: finalY + 4,
            head: [['Tgl Pinjam', 'Peminjam', 'Departemen', 'Status / Tgl Kembali']],
            body: loanRows,
            theme: 'striped',
            headStyles: { fillColor: slateColor as [number, number, number] },
            styles: { fontSize: 8, cellPadding: 2 },
            margin: { left: 14, right: 14 }
        });
    } else {
        doc.setFontSize(10);
        doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
        doc.setFont("helvetica", "italic");
        doc.text('Belum ada riwayat peminjaman.', 14, finalY + 8);
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
        doc.text(`Halaman ${i} dari ${totalPages}`, 14, 285);
        doc.text(`Engineering Asset Management - Detail Report`, 196, 285, { align: 'right' });
    }

    doc.save(`Detail_Item_${item.assetId || 'Unknown'}.pdf`);
};

export const generateMaintenancePDF = (records: any[]) => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape

    // Colors
    const primaryColor = [79, 70, 229]; // Indigo-600
    const slateColor = [100, 116, 139]; // Slate-500
    const lightSlate = [248, 250, 252]; // Slate-50

    // --- HEADER ---
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text('Engineering', 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
    doc.text('Laporan Riwayat Maintenance & Perbaikan', 14, 26);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 283, 26, { align: 'right' });

    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.line(14, 30, 283, 30);

    // --- SUMMARY STATS ---
    const total = records.length;
    const resolved = records.filter(r => (r.kondisiAkhir || "").includes("Normal")).length;
    const pending = records.filter(r => (r.kondisiAkhir || "").includes("Rusak") || (r.kondisiAkhir || "").includes("Maintenance")).length;

    // Draw Summary Boxes
    const drawSummaryBox = (label: string, value: number, color: [number, number, number], x: number) => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, 35, 45, 14, 2, 2, 'FD');
        doc.setFontSize(8);
        doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
        doc.text(label, x + 4, 40);
        doc.setFontSize(10);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont("helvetica", "bold");
        doc.text(value.toString(), x + 4, 46);
    };

    drawSummaryBox("Total Laporan", total, primaryColor as [number, number, number], 14);
    drawSummaryBox("Selesai (Normal)", resolved, [5, 150, 105], 64); // Emerald
    drawSummaryBox("Dalam Proses", pending, [220, 38, 38], 114); // Red

    // --- TABLE ---
    const tableColumn = ["No", "Tanggal", "Nama Barang", "ID Asset", "Masalah", "Tindakan", "Teknisi", "Hasil"];
    const tableRows = records.map((rec, index) => [
        index + 1,
        new Date(rec.tanggalKerusakan).toLocaleDateString('id-ID'),
        rec.itemName || '-',
        rec.assetId || '-',
        rec.penyebab || '-',
        rec.tindakan || '-',
        rec.teknisi || '-',
        rec.kondisiAkhir || '-'
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor as [number, number, number],
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            fontSize: 7.5,
            cellPadding: 2.5,
            overflow: 'linebreak'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 }, // No
            1: { cellWidth: 25 }, // Tanggal
            2: { cellWidth: 40 }, // Nama
            3: { cellWidth: 25 }, // ID
            4: { cellWidth: 45 }, // Masalah
            5: { cellWidth: 45 }, // Tindakan
            6: { cellWidth: 30 }, // Teknisi
            7: { halign: 'center', cellWidth: 30 } // Hasil
        },
        alternateRowStyles: {
            fillColor: lightSlate as [number, number, number]
        },
        didDrawPage: (data) => {
            const str = "Halaman " + doc.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.text(str, data.settings.margin.left, pageHeight - 10);
            doc.text(`Engineering Maintenance Report`, 283, pageHeight - 10, { align: 'right' });
        }
    });

    doc.save(`Laporan_Maintenance_${Date.now()}.pdf`);
};

export const generateLoanPDF = (records: any[]) => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape

    // Colors
    const primaryColor = [79, 70, 229]; // Indigo-600
    const slateColor = [100, 116, 139]; // Slate-500
    const lightSlate = [248, 250, 252]; // Slate-50

    // --- HEADER ---
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text('Engineering', 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
    doc.text('Laporan Riwayat Peminjaman Aset', 14, 26);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 283, 26, { align: 'right' });

    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.line(14, 30, 283, 30);

    // --- SUMMARY STATS ---
    const total = records.length;
    const returned = records.filter(r => r.returnDate).length;
    const active = total - returned;

    // Draw Summary Boxes
    const drawSummaryBox = (label: string, value: number, color: [number, number, number], x: number) => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, 35, 45, 14, 2, 2, 'FD');
        doc.setFontSize(8);
        doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
        doc.text(label, x + 4, 40);
        doc.setFontSize(10);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont("helvetica", "bold");
        doc.text(value.toString(), x + 4, 46);
    };

    drawSummaryBox("Total Pinjaman", total, primaryColor as [number, number, number], 14);
    drawSummaryBox("Sudah Kembali", returned, [5, 150, 105], 64); // Emerald
    drawSummaryBox("Sedang Dipinjam", active, [234, 88, 12], 114); // Orange

    // --- TABLE ---
    const tableColumn = ["No", "Unit / Barang", "Peminjam", "Departemen", "Tgl Pinjam", "Tgl Kembali", "Penerima", "Kondisi"];
    const tableRows = records.map((rec, index) => [
        index + 1,
        `${rec.itemName || '-'} (${rec.assetId || '-'})`,
        rec.borrowerName || '-',
        rec.department || '-',
        new Date(rec.borrowDate).toLocaleDateString('id-ID'),
        rec.returnDate ? new Date(rec.returnDate).toLocaleDateString('id-ID') : 'BELUM KEMBALI',
        rec.returnedBy || '-',
        rec.condition || 'Dipinjam'
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor as [number, number, number],
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            fontSize: 7.5,
            cellPadding: 2.5,
            overflow: 'linebreak'
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 50 },
            2: { cellWidth: 35 },
            3: { cellWidth: 35 },
            4: { cellWidth: 25 },
            5: { cellWidth: 25 },
            6: { cellWidth: 30 },
            7: { halign: 'center', cellWidth: 25 }
        },
        alternateRowStyles: {
            fillColor: lightSlate as [number, number, number]
        },
        didDrawPage: (data) => {
            const str = "Halaman " + doc.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.text(str, data.settings.margin.left, pageHeight - 10);
            doc.text(`Engineering Loan Report`, 283, pageHeight - 10, { align: 'right' });
        }
    });

    doc.save(`Laporan_Peminjaman_${Date.now()}.pdf`);
};

