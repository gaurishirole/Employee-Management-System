import PDFDocument from 'pdfkit';
import { sendMail } from '../config/nodemailer.js';

const formatAmount = (value) => Number(value || 0).toLocaleString('en-IN');

const getDaysInMonth = (month, year) => {
  const monthIndex = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ].indexOf(String(month || '').toLowerCase());

  if (monthIndex < 0) {
    return 30;
  }

  return new Date(Number(year) || new Date().getFullYear(), monthIndex + 1, 0).getDate();
};

export const generateSalarySlipBuffer = async (user, salaryDetails, creditRecord) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
         
      // Header
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#0EA6F0').text('Qiro Tech Innovation Pvt. Ltd.', { align: 'center' });
      doc.moveDown(0.5);
      
      const monthYear = `${creditRecord.month.charAt(0).toUpperCase() + creditRecord.month.slice(1)}, ${creditRecord.year}`;
      doc.fontSize(12).font('Helvetica').fillColor('#333333').text(`Pay Slip for the Month of: ${monthYear}`, { align: 'center' });
      doc.moveDown(2);

      // Section: Employee Details
      doc.fontSize(12).font('Helvetica-Bold').text('Employee Details', 50);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown(0.5);

      const empId = user.id ? String(user.id).padStart(6, '0') : 'N/A';
      const doj = user.dateOfJoining ? new Date(user.dateOfJoining).toLocaleDateString('en-GB') : 'N/A';
      const bankAcc = user.documents?.bankAccountNumber || 'N/A';
      const panNo = 'N/A';

      const details = [
        ['Employee Name', user.name, 'Date of Joining', doj],
        ['Employee ID', empId, 'Bank Account No.', bankAcc],
        ['Designation', user.position || 'N/A', 'PAN No.', panNo],
        ['Department', 'Engineering / General', '', '']
      ];

      doc.font('Helvetica').fontSize(10);
      let startY = doc.y;
      details.forEach(row => {
        doc.text(row[0], 50, startY, { width: 100 });
        doc.text(`: ${row[1]}`, 150, startY, { width: 150 });
        if (row[2]) {
          doc.text(row[2], 300, startY, { width: 100 });
          doc.text(`: ${row[3]}`, 400, startY, { width: 150 });
        }
        startY += 15;
      });

      doc.y = startY + 15;
      doc.moveDown(1);

      // Earnings & Deductions Table
      const tableTop = doc.y;
      
      // Table Header
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff');
      doc.rect(50, tableTop, 500, 20).fill('#94a3b8');
      
      doc.fillColor('#ffffff').text('Earnings', 55, tableTop + 5, { width: 145 });
      doc.text('Amount (₹)', 200, tableTop + 5, { width: 75, align: 'right' });
      doc.text('Deduction', 285, tableTop + 5, { width: 140 });
      doc.text('Amount (₹)', 425, tableTop + 5, { width: 120, align: 'right' });

      // Table Data
      doc.font('Helvetica').fillColor('#333333');
      const salaryBase = Number(user.salary) || Number(salaryDetails?.baseSalary) || 0;
      const bonus = Number(creditRecord.bonus) || 0;
      const daysInMonth = Number(salaryDetails?.daysInMonth) || getDaysInMonth(creditRecord.month, creditRecord.year);
      const absentDays = Number(salaryDetails?.absentDays) || 0;
      const pfEnabled = Boolean(user.pfEnabled);

      const basic = Math.round(salaryBase * 0.48);
      const hra = Math.round(salaryBase * 0.20);
      const lta = Math.round(salaryBase * 0.05);
      const statutoryBonus = Math.round(salaryBase * 0.04);
      const specialAllowance = salaryBase - (basic + hra + lta + statutoryBonus);

      const pt = salaryBase >= 7500 && salaryBase <= 10000 ? 175 : salaryBase > 10000 ? 200 : 0;
      const pf = pfEnabled ? Math.round(basic * 0.12) : 0;
      const lopDeduction = Math.round((salaryBase / daysInMonth) * absentDays);

      const totalEarnings = salaryBase + bonus;
      const totalDeductions = pt + pf + lopDeduction;
      const netSalary = totalEarnings - totalDeductions;

      const rows = [
        ['Basic Pay', formatAmount(basic), 'Provident Fund', pf ? formatAmount(pf) : '-'],
        ['House Rent Allowance', formatAmount(hra), 'Income Tax', '-'],
        ['Special Allowance', formatAmount(specialAllowance), 'Professional Tax', pt ? formatAmount(pt) : '-'],
        ['Leave Travel Allowance', formatAmount(lta), 'Lop / Absence Deduction', lopDeduction ? formatAmount(lopDeduction) : '-'],
        ['Statutory Bonus', formatAmount(statutoryBonus), '', '']
      ];

      if (bonus > 0) {
        rows.push(['Bonus Allocation', formatAmount(bonus), '', '']);
      }

      let rowY = tableTop + 25;
      rows.forEach((row, i) => {
        doc.text(row[0], 55, rowY, { width: 145 });
        doc.text(row[1], 200, rowY, { width: 75, align: 'right' });
        doc.text(row[2], 285, rowY, { width: 140 });
        doc.text(row[3], 425, rowY, { width: 120, align: 'right' });
        
        doc.moveTo(50, rowY + 12).lineTo(550, rowY + 12).strokeColor('#e5e7eb').stroke();
        rowY += 20;
      });

      // Totals
      doc.font('Helvetica-Bold');
      doc.rect(50, rowY, 500, 20).fill('#f9f9f9');
      doc.fillColor('#333333').text('Gross Earnings', 55, rowY + 5, { width: 145 });
      doc.text(formatAmount(totalEarnings), 200, rowY + 5, { width: 75, align: 'right' });
      doc.text('Total Deductions', 285, rowY + 5, { width: 140 });
      doc.text(totalDeductions ? formatAmount(totalDeductions) : '-', 425, rowY + 5, { width: 120, align: 'right' });
      
      doc.rect(50, tableTop, 500, rowY - tableTop + 20).strokeColor('#cbd5e1').stroke();
      doc.moveTo(280, tableTop).lineTo(280, rowY + 20).strokeColor('#cbd5e1').stroke();

      doc.y = rowY + 40;

      // Net Take Home
      doc.font('Helvetica-Bold').fontSize(12);
      doc.rect(50, doc.y, 500, 30).fill('#0EA6F0');
      doc.fillColor('#ffffff').text('Net Salary (Take Home)', 60, doc.y + 10);
      doc.text(`₹ ${formatAmount(netSalary)}`, 400, doc.y + 10, { width: 140, align: 'right' });
      
      doc.moveDown(4);

      // Signatures
      doc.fillColor('#333333').font('Helvetica');
      const sigY = doc.y;
      doc.text('_______________________', 50, sigY);
      doc.text('Employer Signature', 50, sigY + 15);
      
      doc.text('_______________________', 350, sigY, { align: 'right', width: 200 });
      doc.text('Employee Signature', 350, sigY + 15, { align: 'right', width: 200 });

      doc.fontSize(8).fillColor('#999999').text('This is a system-generated document and does not require a physical signature.', 50, 750, { align: 'center', width: 500 });

      doc.end();

    } catch (err) {
      console.error("PDF Generation error:", err);
      reject(err);
    }
  });
};

export const generateAndSendSalarySlip = async (user, salaryDetails, creditRecord) => {
  try {
    const pdfData = await generateSalarySlipBuffer(user, salaryDetails, creditRecord);

    const monthYear = `${creditRecord.month.charAt(0).toUpperCase() + creditRecord.month.slice(1)} ${creditRecord.year}`;
    const subject = `Salary Slip - ${monthYear}`;
    
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0EA6F0;">Salary Credited</h2>
      <p>Dear ${user.name},</p>
      <p>Your salary for the month of <strong>${monthYear}</strong> has been credited to your account.</p>
      <p>Please find attached your detailed pay slip.</p>
      <br/>
      <p>Best regards,</p>
      <p><strong>Qiro Tech Innovation Pvt. Ltd.</strong></p>
    </div>
    `;

    const attachment = {
      filename: `Salary_Slip_${monthYear.replace(' ', '_')}.pdf`,
      content: pdfData,
      contentType: 'application/pdf'
    };

    await sendMail(user.email, subject, "Please find your attached salary slip.", htmlContent, [attachment]);
  } catch (err) {
    console.error("Failed to generate and send salary slip:", err);
    throw err;
  }
};
