const welcomeEmail = (userName: string): string => `
  <html>
    <body>
      <h1>Welcome to Our Platform, ${userName}!</h1>
      <p>Thanks for reaching out. I'll get back to you shortly.</p>
      <p>Best regards,<br>Tobie</p>
    </body>
  </html>
`;

export default welcomeEmail;
