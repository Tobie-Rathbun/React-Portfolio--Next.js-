const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello from serverless function!' });
});

module.exports = app;
module.exports.handler = serverless(app);
