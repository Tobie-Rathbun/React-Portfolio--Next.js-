exports.handler = async (event) => {
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      console.log('Form submission:', data);
  
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Form submitted successfully!' }),
      };
    }
  
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  };
  