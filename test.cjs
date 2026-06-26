const http = require('http');

const data = JSON.stringify({
  messages: [{role: "user", content: "hi"}]
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/gemini/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk.toString());
  res.on('end', () => console.log(body));
});

req.write(data);
req.end();
