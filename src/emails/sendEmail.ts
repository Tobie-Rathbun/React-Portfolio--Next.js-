import sendgrid from '@sendgrid/mail';

// Initialize SendGrid with your API key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

// Type for the email data
export interface EmailData {
  to: string;
  subject: string;
  html: string; // Email content as HTML
}

export const sendEmail = async ({ to, subject, html }: EmailData): Promise<void> => {
  try {
    await sendgrid.send({
      to,
      from: 'your-email@example.com', // Verified sender address
      subject,
      html,
    });
    console.log('Email sent successfully');
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
