exports.handler = async (event) => {
  try {
    // Check for POST request
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    // Parse the request body
    const data = JSON.parse(event.body);

    // Basic validation
    const { name, email, message } = data;
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'All fields are required' }),
      };
    }

    // Log the submission (optional, for debugging purposes)
    console.log('Form submission received:', { name, email, message });

    // Optional: Add functionality such as sending an email
    // Example: Use a third-party service like SendGrid or AWS SES
    /*
    await sendEmail({
      to: 'your-email@example.com',
      subject: `New Contact Form Submission from ${name}`,
      text: `Message: ${message}\nFrom: ${email}`,
    });
    */

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Form submitted successfully!' }),
    };
  } catch (error) {
    console.error('Error handling contact form submission:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
