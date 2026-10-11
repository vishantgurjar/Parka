const nodemailer = require('nodemailer');

/**
 * Strips HTML tags and formats clean plain text for email clients
 */
function stripHtmlToText(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n$1\n' + '-'.repeat(30) + '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<hr[^>]*>/gi, '\n' + '-'.repeat(30) + '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&copy;/g, '©')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generates an ultra-deliverable, light-themed HTML email template that avoids Spam/Junk filters
 */
function buildCleanEmailHtml({ title, preheader = '', greeting = 'Hello,', bodyText = '', highlightBox = '', alertText = '', footerNote = '' }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  ${preheader ? `<div style="display: none; max-height: 0px; overflow: hidden; opacity: 0;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f6f8; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 24px 30px; background-color: #0f172a; text-align: left; border-bottom: 3px solid #0d9488;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; color: #ffffff;">PARXÉÉ CITY</h1>
                    <p style="margin: 3px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">Intelligent Vehicle Security</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px 30px 24px 30px; background-color: #ffffff;">
              <h2 style="margin: 0 0 16px 0; font-size: 19px; font-weight: 700; color: #0f172a;">${title}</h2>
              ${greeting ? `<p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.6; color: #334155;">${greeting}</p>` : ''}
              ${bodyText ? `<div style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #334155;">${bodyText}</div>` : ''}
              
              <!-- Highlight / OTP Box -->
              ${highlightBox ? `
              <div style="margin: 24px 0; text-align: center; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px;">
                ${highlightBox}
              </div>` : ''}

              <!-- Alert / Info Notice -->
              ${alertText ? `
              <div style="margin: 20px 0 0 0; padding: 14px 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 13px; line-height: 1.5; color: #92400e;">
                ${alertText}
              </div>` : ''}
            </td>
          </tr>

          <!-- Security / Note Section -->
          ${footerNote ? `
          <tr>
            <td style="padding: 0 30px 24px 30px; background-color: #ffffff;">
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">${footerNote}</p>
            </td>
          </tr>` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                This is an automated transactional notification sent by <strong>Parxéé City Services</strong>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} Parxéé City Inc. All rights reserved. • Support: support@parxeecity.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send email using configured credentials with serverless-friendly transports
 * @param {object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} [options.text]
 * @param {string} [options.html]
 * @param {string} [options.fromName]
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
async function sendEmail({ to, subject, text, html, fromName = 'Parxéé City' }) {
  const customUser = (process.env.EMAIL_USER || '').trim();
  const customPass = (process.env.EMAIL_PASS || '').trim();
  const fallbackUser = 'panwarvishant9@gmail.com';
  const fallbackPass = 'gsevjfbnttdlginj'; // App Password for panwarvishant9@gmail.com

  const user = customUser || fallbackUser;
  const pass = (customPass && customPass !== 'your_gmail_app_password_here') ? customPass.replace(/\s+/g, '') : fallbackPass;

  const plainText = text || stripHtmlToText(html) || subject;

  const mailOptions = {
    from: `"${fromName}" <${user}>`,
    to: to,
    replyTo: user,
    subject: subject,
    text: plainText,
    headers: {
      'X-Priority': '1 (Highest)',
      'X-MSMail-Priority': 'High',
      'Importance': 'High',
      'X-Mailer': 'ParxeeCity Email Dispatcher'
    }
  };

  if (html) {
    mailOptions.html = html;
  }

  // 1. Primary Attempt: Standard Gmail Service (Recommended for Serverless)
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      timeout: 10000,
      connectionTimeout: 8000
    });

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Helper] Gmail service email sent to ${to}! MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err1) {
    console.warn(`[Email Helper] Gmail service attempt failed: ${err1.message}. Trying SMTP port 587 STARTTLS...`);

    // 2. Secondary Attempt: Port 587 STARTTLS (Alternative for cloud containers)
    try {
      const smtpTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
        timeout: 10000,
        connectionTimeout: 8000
      });

      const info = await smtpTransporter.sendMail(mailOptions);
      console.log(`[Email Helper] Port 587 SMTP email sent to ${to}! MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err2) {
      console.error(`[Email Helper] Port 587 SMTP failed: ${err2.message}. Trying Port 465 SSL...`);

      // 3. Final Fallback: Port 465 direct SSL
      try {
        const sslTransporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
          timeout: 10000,
          connectionTimeout: 8000
        });

        const info = await sslTransporter.sendMail(mailOptions);
        console.log(`[Email Helper] Port 465 SSL email sent to ${to}! MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (err3) {
        console.error(`[Email Helper] All email delivery methods failed: ${err3.message}`);
        return { success: false, error: err3.message };
      }
    }
  }
}

module.exports = { sendEmail, buildCleanEmailHtml, stripHtmlToText };
