const express = require('express');
const { PeerServer } = require('peer');

const app = express();
const PORT = 3000;

// Serve static files (like index.html) from 'public' folder
app.use(express.static('public'));

const peerServer = PeerServer({
  port: 9000,
  path: '/dashboard'
});

app.listen(PORT, () => {
  console.log(`App server running at http://localhost:${PORT}`);
  console.log('PeerJS server running at ws://localhost:9000/dashboard');
});
