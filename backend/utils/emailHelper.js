const nodemailer = require('nodemailer');

/**
 * Send email using configured environment variables or fallback credentials
 * @param {object} options - Mail options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML body
 * @param {string} [options.fromName] - Friendly sender name
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
async function sendEmail({ to, subject, text, html, fromName = 'Parxéé City Support' }) {
  const customUser = (process.env.EMAIL_USER || '').trim();
  const customPass = (process.env.EMAIL_PASS || '').trim();
  const customService = (process.env.EMAIL_SERVICE || 'gmail').trim();

  const fallbackUser = 'panwarvishant9@gmail.com';
  const fallbackPass = 'gsev jfbn ttdl ginj'.replace(/\s+/g, '');

  let transporter;
  let fromEmail = customUser || fallbackUser;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: to,
    subject: subject,
  };
  if (text) mailOptions.text = text;
  if (html) mailOptions.html = html;

  // 1. Try custom credentials if configured
  if (customUser && customPass && customPass !== 'your_gmail_app_password_here') {
    try {
      console.log(`[Email Helper] Attempting to send email to ${to} via custom SMTP (${customUser})...`);
      // Try Direct SMTP (smtp.gmail.com:465) first
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: customUser, pass: customPass },
        tls: { rejectUnauthorized: false }
      });
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Helper] Custom SSL SMTP success! MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[Email Helper] Custom SSL SMTP error: ${err.message}. Trying service Gmail fallback...`);
      try {
        transporter = nodemailer.createTransport({
          service: customService,
          auth: { user: customUser, pass: customPass }
        });
        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Helper] Custom Service Gmail fallback success! MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (err2) {
        console.error(`[Email Helper] Custom Service Gmail fallback failed: ${err2.message}`);
      }
    }
  }

  // 2. Fallback to default hardcoded credentials
  try {
    console.log(`[Email Helper] Falling back to default SMTP credentials (${fallbackUser})...`);
    // Adjust from header to use the actual authenticated sender
    mailOptions.from = `"${fromName}" <${fallbackUser}>`;
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: fallbackUser, pass: fallbackPass },
      tls: { rejectUnauthorized: false }
    });
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Helper] Fallback SMTP Success! MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (errFallback) {
    console.error(`[Email Helper] Fallback SMTP failed: ${errFallback.message}. Trying Fallback Service Gmail...`);
    
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: fallbackUser, pass: fallbackPass }
      });
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Helper] Fallback Service Gmail Success! MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (errFallback2) {
      console.error(`[Email Helper] Fallback Service Gmail failed: ${errFallback2.message}`);
      return { success: false, error: errFallback2.message };
    }
  }
}

module.exports = { sendEmail };
