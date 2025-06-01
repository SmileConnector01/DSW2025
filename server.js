import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());


app.use(express.static(path.join(__dirname)));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use('/stylesheets', express.static(path.join(__dirname, 'stylesheets')));
app.use('/homePage', express.static(path.join(__dirname, 'homePage')));


app.get('/api/maps-key', (req, res) => {
  res.json({ 
    apiKey: process.env.GOOGLE_MAPS_API_KEY 
  });
});

// Route for your testing page
app.get('/testing', (req, res) => {
  res.sendFile(path.join(__dirname, 'homePage', 'testing.html'));
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'homePage', 'homep.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log(`- http://localhost:${PORT}/testing`);
  console.log(`- http://localhost:${PORT}/homePage/education-3dModel.html`);
  console.log(`- http://localhost:${PORT}/homePage/education-video.html`);
});