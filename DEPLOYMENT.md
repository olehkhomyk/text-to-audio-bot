# Deployment Guide for Render

## Prerequisites
- Telegram Bot Token from [@BotFather](https://t.me/botfather)
- ElevenLabs API Key from [ElevenLabs Dashboard](https://elevenlabs.io)

## Deploy to Render

### 1. Connect Repository
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository: `olehkhomyk/text-to-audio-bot`

### 2. Configure Service
Render will automatically detect `render.yaml`. Verify settings:
- **Name**: `telegram-ttv-bot`
- **Environment**: `Node`
- **Region**: `Frankfurt`
- **Branch**: `main`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:build`

### 3. **CRITICAL: Set Environment Variables**
In Render Dashboard → Environment tab, add these **Secret Files**:

| Key | Value | Notes |
|-----|-------|-------|
| `TG_BOT_TOKEN` | `7629334141:XXX...` | Your Telegram bot token |
| `ELEVENLABS_API_KEY` | `sk_...` | Your ElevenLabs API key |
| `NODE_ENV` | `production` | Already in render.yaml |

**⚠️ Without these variables, the bot will fail to start!**

### 4. Deploy
1. Click **Create Web Service**
2. Wait for build to complete (~2-3 minutes)
3. Check logs for: `✅ Telegram bot started successfully`

## Verify Deployment

### Check Health Endpoint
```bash
curl https://telegram-ttv-bot.onrender.com/health
```

Expected response:
```json
{"status":"ok","uptime":123.456}
```

### Test Bot
1. Open Telegram and find your bot
2. Send `/start` - should reply "Welcome"
3. Send any text - bot will convert to Ukrainian voice audio

## Troubleshooting

### Error: `ETIMEDOUT` or `Connection timeout`
**Cause**: Environment variables not set on Render

**Fix**: 
1. Go to Render Dashboard → Your Service → Environment
2. Add `TG_BOT_TOKEN` and `ELEVENLABS_API_KEY`
3. Save changes (will auto-redeploy)

### Error: `❌ TG_BOT_TOKEN is not set!`
**Cause**: Missing environment variable

**Fix**: Add the variable in Render Dashboard

### Bot doesn't respond
**Cause**: Bot may still be starting or crashed

**Fix**: Check logs in Render Dashboard for errors

## Local Development

```bash
# Install dependencies
npm install

# Create .env file
echo "TG_BOT_TOKEN=your_token_here" > .env
echo "ELEVENLABS_API_KEY=your_key_here" >> .env

# Run in development mode
npm run start:dev:watch
```

## Notes
- Render free tier may take 30-60 seconds to wake up from sleep
- Bot supports Ukrainian text via `eleven_multilingual_v2` model
- Voice used: Anton (Ukrainian)
