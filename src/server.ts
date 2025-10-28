import express from 'express';

export function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.get('/', (req, res) => {
    res.send('🤖 Telegram TTS Bot is running!');
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
  });
}
