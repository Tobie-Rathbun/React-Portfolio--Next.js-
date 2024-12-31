import sendgrid from '@sendgrid/mail';

// Set SendGrid API key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

// Define types for email payload
interface EmailPayload {
  to: string;
  from: string;
  subject: string;
  html: string;
}

// Function to send emails
export const sendEmail = async ({ to, from, subject, html }: EmailPayload): Promise<void> => {
  try {
    await sendgrid.send({
      to,
      from,
      subject,
      html,
    });
    console.log('Email sent successfully');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error sending email:', error.message);
      throw new Error('Failed to send email');
    } else {
      console.error('Unknown error occurred while sending email:', error);
      throw new Error('An unknown error occurred');
    }
  }
};
