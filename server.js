const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8080;

const server = http.createServer((req, res) => {
  const filePath = req.url === '/' ? '/index.html' : req.url;
  const contentType = getContentType(filePath);
  const absoluteFilePath = path.join(__dirname, filePath);

  fs.readFile(absoluteFilePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404: File Not Found');
      } else {
        res.writeHead(500);
        res.end('500: Internal Server Error');
      }
    } else {
      res.setHeader('Content-Type', contentType);
      res.writeHead(200);
      res.end(data);
    }
  });
});

function getContentType(filePath) {
  const ext = path.extname(filePath);
  switch (ext) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'application/javascript';
    default:
      return 'application/octet-stream';
  }
}

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
