const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.static('.'));

http.listen(8081, () => {
  console.log('WARNING: run this server on the internet\nlistening on *:8081');
});
