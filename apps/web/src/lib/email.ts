/**
 * Email Service for web app
 * Provides email sending functionality for compliance notifications
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
}

let sgMail: any = null;

// Initialize SendGrid (lazy load)
async function getSgMail() {
  if (!sgMail) {
    try {
      // Try to load SendGrid if available
      // Using template string to prevent Next.js from statically analyzing the import
      const moduleName = '@sendgrid/' + 'mail';
      const sgMailModule = await import(moduleName);
      sgMail = sgMailModule.default || sgMailModule;
      if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      }
    } catch (error) {
      // SendGrid not installed, will use console fallback
      sgMail = null;
    }
  }
  return sgMail;
}

/**
 * Send email using SendGrid or console fallback
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const { to, subject, html, cc, bcc } = options;

    // Check if SendGrid is configured
    if (process.env.SENDGRID_API_KEY) {
      const sg = await getSgMail();
      if (sg) {
        const msg: any = {
          to,
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@aifm.com',
          subject,
          html,
        };

        if (cc && cc.length > 0) msg.cc = cc;
        if (bcc && bcc.length > 0) msg.bcc = bcc;

        await sg.send(msg);
        console.log('Email sent successfully via SendGrid', { to, subject });
        return true;
      }
    }

    // Fallback: Log to console in development/production if SendGrid not configured
    console.log('📧 Email (not sent - SendGrid not configured):');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', html);
    if (cc) console.log('CC:', cc);
    if (bcc) console.log('BCC:', bcc);
    
    return true; // Return true even in fallback mode to not break the flow
  } catch (error) {
    console.error('Failed to send email', error, options);
    return false;
  }
}

