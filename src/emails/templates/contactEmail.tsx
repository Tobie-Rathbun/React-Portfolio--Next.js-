const contactEmail = (name: string, email: string, message: string): string => `
  <html>
    <body>
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    </body>
  </html>
`;

export default contactEmail;
