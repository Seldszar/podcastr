/* eslint-disable global-require, import/no-extraneous-dependencies */

const express = require('express');
const http = require('http');

function createServer() {
  const app = express();
  const server = http.createServer(app);
  const io = require('socket.io')(server);

  app.use(express.static('public'));

  return {
    app,
    io,
    server,
  };
}

module.exports = createServer;
