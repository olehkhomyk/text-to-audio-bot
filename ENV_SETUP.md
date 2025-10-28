# Environment Variables Setup

## How It Works

### 🏠 Local Development
- **File**: `.env` (in project root)
- **Loaded by**: `dotenv.config()` when `NODE_ENV !== 'production'`
- **Log message**: `🔧 Loading .env file (local development)`

**Setup:**
```bash
# Copy example file
cp .env.example .env

# Edit with your keys
nano .env
```

### ☁️ Production (Render)
- **Source**: Render Dashboard UI (Environment tab)
- **Set by**: `NODE_ENV=production` in `render.yaml`
- **Loaded by**: Render injects vars directly into process.env
- **Log message**: `☁️  Using environment variables from Render`

**Setup:**
1. Go to Render Dashboard
2. Select service: `telegram-ttv-bot`
3. Click **Environment** tab
4. Add variables:
   - `TG_BOT_TOKEN`
   - `ELEVENLABS_API_KEY`

---

## Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TG_BOT_TOKEN` | Telegram Bot Token from @BotFather | `7629334141:AAH...` |
| `ELEVENLABS_API_KEY` | ElevenLabs API Key | `sk_abc123...` |
| `NODE_ENV` | Environment mode (auto-set on Render) | `production` |

---

## Validation

The app validates required variables on startup:
```
✅ Both variables set → App starts
❌ Missing variable → App exits with error
```

---

## Port Configuration

- **Local**: Defaults to `3000` (can override with `PORT=3000` in `.env`)
- **Render**: Automatically uses Render's `PORT` env var (usually `10000`)

---

## Testing Environment Loading

### Local:
```bash
npm run start:dev:watch
```
Expected output:
```
🔧 Loading .env file (local development)
🌐 Server running on port 3000
🤖 Launching Telegram bot...
✅ Telegram bot started successfully
✅ Application started successfully
```

### Production (Render):
Expected output in logs:
```
☁️  Using environment variables from Render
🌐 Server running on port 10000
🤖 Launching Telegram bot...
✅ Telegram bot started successfully
✅ Application started successfully
```

---

## Troubleshooting

### ❌ `TG_BOT_TOKEN is not set!`
**Local**: Check your `.env` file exists and has the token  
**Render**: Add variable in Render Dashboard → Environment

### ❌ `ELEVENLABS_API_KEY is not set!`
**Local**: Check your `.env` file has the API key  
**Render**: Add variable in Render Dashboard → Environment

### 🔧 Wrong environment detected
If Render shows "Loading .env file" instead of "Using environment variables from Render":
- Verify `NODE_ENV=production` is set in `render.yaml` ✅ (already configured)
- Check Render Dashboard shows `NODE_ENV=production` in Environment tab
