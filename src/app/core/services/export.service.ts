import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Export JSON data to Excel
   * @param data - Array of objects to export
   * @param fileName - Target file name
   */
  exportToExcel(data: any[], fileName: string = 'export'): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, `${fileName}_${new Date().getTime()}.xlsx`);
  }

  /**
   * Export data to a professional PDF table
   * @param title - Table title
   * @param columns - Array of column definitions {header, dataKey}
   * @param data - Array of data rows
   * @param fileName - Target file name
   */
  exportToPDF(title: string, columns: any[], data: any[], fileName: string = 'report'): void {
    const doc = new jsPDF();
    
    // Add Branding / Header
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243); // Primary color
    doc.text('VyaparPOS', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(title, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
    
    // Add Table
    autoTable(doc, {
      startY: 45,
      head: [columns.map(c => c.header)],
      body: data.map(row => columns.map(c => row[c.dataKey])),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [33, 150, 243], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    doc.save(`${fileName}_${new Date().getTime()}.pdf`);
  }

  /**
   * Generate a professional POS invoice PDF
   * @param sale - Sale object with items
   */
  generateInvoicePDF(sale: any): void {
    const doc = new jsPDF({ format: 'a4' });
    
    // Header Section
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', 140, 30);
    
    doc.setFontSize(12);
    doc.text('VyaparPOS Bakery Solutions', 14, 25);
    doc.setFontSize(9);
    doc.text('GSTIN: 27AAAAA0000A1Z5', 14, 32);
    doc.text('Contact: +91 9173255146', 14, 37);
    
    // Bill To Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 14, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(sale.customerName || 'Cash Customer', 14, 62);
    if (sale.address) doc.text(sale.address, 14, 67);
    
    // Invoice Meta Section
    doc.text(`Invoice No: ${sale.saleNumber || 'N/A'}`, 140, 55);
    doc.text(`Date: ${new Date(sale.timestamp || Date.now()).toLocaleDateString()}`, 140, 62);
    
    // Items Table
    const tableColumns = [
      { header: 'Item', dataKey: 'name' },
      { header: 'Price', dataKey: 'price' },
      { header: 'Qty', dataKey: 'quantity' },
      { header: 'GST %', dataKey: 'gstRate' },
      { header: 'Total', dataKey: 'total' }
    ];
    
    const tableData = (sale.items || []).map((item: any) => ({
      name: item.name || item.product?.name,
      price: `Rs ${item.price}`,
      quantity: item.quantity,
      gstRate: `${item.gstRate || 0}%`,
      total: `Rs ${item.total}`
    }));
    
    autoTable(doc, {
      startY: 80,
      head: [tableColumns.map(c => c.header)],
      body: tableData.map((row: any) => tableColumns.map(c => row[c.dataKey])),
      headStyles: { fillColor: [0, 0, 0] },
      foot: [
        ['', '', '', 'Subtotal:', `Rs ${sale.totalAmount - (sale.tax || 0)}`],
        ['', '', '', 'Tax Amount:', `Rs ${sale.tax || 0}`],
        ['', '', '', 'GRAND TOTAL:', `Rs ${sale.totalAmount}`]
      ],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });
    
    // Footer / Terms
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(9);
    doc.text('Thank you for your business!', 14, finalY);
    doc.text('Terms: Goods once sold will not be taken back.', 14, finalY + 7);
    
    doc.save(`Invoice_${sale.saleNumber || 'Order'}.pdf`);
  }
}
