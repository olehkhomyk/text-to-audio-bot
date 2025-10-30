import express from 'express';

export function startServer(botMiddleware?: any): Promise<void> {
  return new Promise((resolve) => {
    const app = express();
    const PORT = Number(process.env.PORT) || 3000;

    app.use(express.json());

    app.get('/', (_req, res) => res.send('🤖 Telegram TTS Bot is running!'));
    app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() }));

    if (botMiddleware) {
      app.use(botMiddleware);
    }

    const server = app.listen(PORT, () => {
      console.log(`🌐 Server running on port ${PORT}`);
      resolve();
    });

    server.on('error', (error) => console.error('Server error:', error));
  });
}
