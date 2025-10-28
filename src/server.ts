import express from 'express';

export function startServer(): Promise<void> {
  return new Promise((resolve) => {
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.get('/', (req, res) => {
      res.send('🤖 Telegram TTS Bot is running!');
    });

    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });

    const server = app.listen(PORT, () => {
      console.log(`🌐 Server running on port ${PORT}`);
      resolve();
    });

    // Error handling
    server.on('error', (error) => {
      console.error('Server error:', error);
    });
  });
}