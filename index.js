const express = require('express');
const { GClient, GLocalAuth } = require('get-contact.js');
const qrcode = require('qrcode-terminal');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));  // Folder public untuk file statis

// Inisialisasi client GetContact
const client = new GClient({
  puppeteer: {
    headless: false,
  },
  authStrategy: new GLocalAuth({
    clientId: "test-aja-inimah",
  }),
});

// QR code event
client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true });
});

// Event setelah otentikasi berhasil
client.on('authenticated', async () => {
  console.log('Authenticated');
});

// Event ketika client siap digunakan
client.on('ready', () => {
  console.log('Client is ready!');
});

// Endpoint untuk mendapatkan QR code
app.get('/get-qr', (req, res) => {
  client.getQrCode().then(qrCode => {
    res.json({ qrCode });
  }).catch(err => {
    res.status(500).json({ error: 'Error fetching QR code' });
  });
});

// Endpoint untuk mencari nomor telepon
app.post('/search', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Nomor telepon harus disertakan.' });
  }

  try {
    const result = await client.searchNumber("ID", phoneNumber);
    res.json(result); // Mengirim hasil pencarian ke frontend
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
