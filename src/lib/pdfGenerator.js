// lib/pdfGenerator.js

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateBillPDF(order) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  
  // Load fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Set up margins and positions
  const margin = 50;
  let yPosition = height - margin;
  
  // Add header
  page.drawText('DELICIOUS BITES CAFÉ', {
    x: margin,
    y: yPosition,
    size: 20,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 30;
  
  page.drawText('123 Food Street, Tasty City', {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 20;
  
  page.drawText('Phone: +91 9876543210 | GSTIN: 12ABCDE1234F1Z2', {
    x: margin,
    y: yPosition,
    size: 10,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 40;
  
  // Add order details
  page.drawText(`Bill No: ${order.tokenNumber}`, {
    x: margin,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;
  
  const orderDate = new Date(order.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  page.drawText(`Date: ${orderDate}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;
  
  // Customer details
  page.drawText(`Customer: ${order.customer?.name || 'Walk-in Customer'}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  yPosition -= 15;
  
  if (order.customer?.phone) {
    page.drawText(`Phone: ${order.customer.phone}`, {
      x: margin,
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;
  }
  
  yPosition -= 20;
  
  // Draw a line
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  yPosition -= 30;
  
  // Table headers
  page.drawText('Item', {
    x: margin,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Qty', {
    x: width - 150,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Amount', {
    x: width - margin - 70,
    y: yPosition,
    size: 12,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= 25;
  
  // Draw a line under headers
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  yPosition -= 20;
  
  // Order items
  for (const item of order.items) {
    // Item name (with wrapping if needed)
    const itemName = item.name.length > 30 ? item.name.substring(0, 27) + '...' : item.name;
    
    page.drawText(itemName, {
      x: margin,
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
      maxWidth: width - 200,
    });
    
    page.drawText(`${item.quantity}`, {
      x: width - 150,
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    page.drawText(`₹${(item.price * item.quantity).toFixed(2)}`, {
      x: width - margin - 70,
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 20;
    
    // Add a small gap between items
    yPosition -= 5;
  }
  
  yPosition -= 10;
  
  // Draw a line above total
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: width - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  yPosition -= 25;
  
  // Total amount
  page.drawText('Total:', {
    x: width - 150,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`₹${order.total.toFixed(2)}`, {
    x: width - margin - 70,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= 40;
  
  // Payment details
  page.drawText(`Payment Method: ${order.paymentMethod || 'Razorpay'}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= 20;
  
  page.drawText(`Payment Status: ${order.paymentStatus || 'Completed'}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= 40;
  
  // Thank you message
  page.drawText('Thank you for your order!', {
    x: margin,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: rgb(0.6, 0.2, 0),
  });
  
  yPosition -= 20;
  
  page.drawText('Visit us again soon!', {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  
  return pdfBytes;
}