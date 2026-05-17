// pdfgen.jsx — barcode label & warranty card PDF generation
// Uses jsPDF + JsBarcode (drawn to canvas then embedded).

function generateBarcodeLabel(c, sel) {
  if (!window.jspdf || !window.JsBarcode) {
    alert('PDF library not loaded — try refreshing the page.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const lab = sel.labConfig;
  const u = sel.urgency(c.urgency);
  const ct = sel.caseTypeName(c.caseType);
  const due = formatDate(c.dueDate);

  // 4×3 inch label = 102 × 76 mm
  const doc = new jsPDF({ unit: 'mm', format: [102, 76], orientation: 'landscape' });

  // Urgency stripe down the left edge
  const urgColors = {
    normal: [216, 207, 190],
    district: [184, 134, 42],
    emergency: [168, 71, 58],
  };
  const stripe = urgColors[u?.tone || 'normal'];
  doc.setFillColor(...stripe);
  doc.rect(0, 0, 6, 76, 'F');

  // Lab name (top)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(120, 113, 100);
  doc.text(lab.labName.toUpperCase(), 10, 8);

  // Patient name (huge)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(28, 22, 18);
  doc.text(c.patient, 10, 18, { maxWidth: 90 });

  // Case type + units
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(59, 52, 45);
  doc.text(`${ct} · ${c.units} unit${c.units > 1 ? 's' : ''}`, 10, 25);

  // Urgency tag
  doc.setFillColor(...stripe);
  doc.roundedRect(10, 29, 30, 6, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text((u?.name || 'NORMAL').toUpperCase(), 12, 33);

  // Due date
  doc.setTextColor(59, 52, 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Due ${due}`, 44, 33);

  // Dentist
  doc.setFontSize(8);
  doc.setTextColor(120, 113, 100);
  doc.text(`From: ${c.dentistName}`, 10, 42, { maxWidth: 90 });

  // Instructions (truncated)
  if (c.instructions) {
    doc.setFontSize(7);
    doc.text(c.instructions, 10, 48, { maxWidth: 90 });
  }

  // Barcode (Code 128)
  const canvas = document.createElement('canvas');
  try {
    window.JsBarcode(canvas, c.id, {
      format: 'CODE128',
      width: 2,
      height: 40,
      displayValue: false,
      margin: 0,
    });
    const png = canvas.toDataURL('image/png');
    doc.addImage(png, 'PNG', 10, 52, 70, 14);
  } catch (e) {
    console.warn('Barcode draw failed', e);
  }

  // Case ID text
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(28, 22, 18);
  doc.text(c.id, 10, 71);

  // Stages indicator (visual on right edge)
  const stages = lab.stages;
  const sw = 14, sh = 4;
  let sy = 8;
  stages.forEach((st, i) => {
    doc.setFillColor(232, 223, 210);
    doc.roundedRect(82, sy, sw, sh, 0.5, 0.5, 'F');
    doc.setTextColor(90, 81, 71);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(st.name.toUpperCase(), 89, sy + 2.8, { align: 'center' });
    sy += sh + 1.2;
  });

  doc.save(`${c.id}-label.pdf`);
}

function generateWarrantyCard(c, sel) {
  if (!window.jspdf) {
    alert('PDF library not loaded — try refreshing the page.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const lab = sel.labConfig;
  const ct = sel.caseTypeName(c.caseType);
  const w = c.warranty;
  if (!w) {
    alert('No warranty issued for this case yet.');
    return;
  }
  const issued = formatDate(w.issuedAt);
  const expiry = new Date(w.issuedAt);
  expiry.setMonth(expiry.getMonth() + w.months);

  // A5 portrait
  const doc = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' });

  // Border
  doc.setDrawColor(180, 114, 74);
  doc.setLineWidth(0.8);
  doc.rect(8, 8, 132, 194);
  doc.setLineWidth(0.2);
  doc.setDrawColor(216, 207, 190);
  doc.rect(11, 11, 126, 188);

  // Lab name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(28, 22, 18);
  doc.text(lab.labName, 74, 26, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 113, 100);
  doc.text(`${lab.labCity} · ${lab.labPhone}`, 74, 32, { align: 'center' });

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(107, 58, 31);
  doc.text('WARRANTY', 74, 50, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(59, 52, 45);
  doc.text('Certificate', 74, 56, { align: 'center' });

  if (w.voidedAt) {
    doc.setTextColor(168, 71, 58);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(48);
    doc.text('VOID', 74, 110, { align: 'center', angle: -18 });
    doc.setFontSize(10);
    doc.text('Cancelled: ' + (w.voidReason || ''), 74, 122, { align: 'center' });
  }

  // Body fields
  const fields = [
    ['Warranty No.', w.number],
    ['Patient', c.patient],
    ['Dentist', c.dentistName],
    ['Clinic', c.dentistClinic],
    ['Case type', ct + (c.units > 1 ? ` · ${c.units} units` : '')],
    ['Materials', '—'],
    ['Date of completion', issued],
    ['Warranty period', `${w.months} months`],
    ['Expires', expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
  ];

  let y = 72;
  fields.forEach(([k, v]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 113, 100);
    doc.text(k.toUpperCase(), 20, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(28, 22, 18);
    doc.text(String(v), 20, y + 5, { maxWidth: 100 });
    y += 13;
  });

  // Footer / stamp
  y += 4;
  doc.setDrawColor(180, 114, 74);
  doc.setLineWidth(0.4);
  doc.line(20, y, 60, y);
  doc.line(88, y, 128, y);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 113, 100);
  doc.text('Authorised signature', 40, y + 5, { align: 'center' });
  doc.text('Lab stamp', 108, y + 5, { align: 'center' });

  doc.save(`${w.number}.pdf`);
}

Object.assign(window, { generateBarcodeLabel, generateWarrantyCard });
