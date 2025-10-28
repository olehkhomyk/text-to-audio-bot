# 🚀 Quick Render Setup Checklist

## What Was Fixed

### 1. ✅ Added Environment Variable References
Updated `render.yaml` to include:
- `TG_BOT_TOKEN` (sync: false)
- `ELEVENLABS_API_KEY` (sync: false)

### 2. ✅ Fixed Start Command
Changed from `npm start` → `npm run start:build` to avoid loading `.env` file

### 3. ✅ Added Error Handling
- Bot initialization now has try-catch to prevent crashes
- Server will stay running even if bot fails to connect
- Clear error messages in logs

### 4. ✅ Added Environment Validation
App validates required env vars before starting

### 5. ✅ Moved `dotenv` to Production Dependencies
Was in `devDependencies` but needed in production for `dotenv.config()`

---

## 🔴 ACTION REQUIRED: Set Environment Variables on Render

### Step-by-Step:

1. **Go to Render Dashboard**
   - Navigate to: https://dashboard.render.com/
   - Find your service: `telegram-ttv-bot`

2. **Click Environment Tab** (left sidebar)

3. **Add Environment Variables:**
   
   Click **"Add Environment Variable"** and add:
   
   ```
   Key: TG_BOT_TOKEN
   Value: 7629334141:AAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
   
   Click **"Add Environment Variable"** again and add:
   
   ```
   Key: ELEVENLABS_API_KEY  
   Value: sk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

4. **Save Changes**
   - Render will automatically redeploy with the new variables

5. **Monitor Logs**
   - Go to "Logs" tab
   - Look for: `✅ Telegram bot started successfully`
   - Also look for: `🌐 Server running on port 10000`

---

## ✅ Expected Output in Logs

```
🌐 Server running on port 10000
🤖 Launching Telegram bot...
✅ Telegram bot started successfully
✅ Application started successfully
```

---

## 🧪 Test Your Bot

Once deployed:

1. **Test Health Endpoint:**
   ```bash
   curl https://telegram-ttv-bot.onrender.com/health
   ```
   Should return: `{"status":"ok","uptime":...}`

2. **Test Telegram Bot:**
   - Open your bot in Telegram
   - Send: `/start` → Should reply "Welcome"
   - Send any Ukrainian or English text → Should receive voice message

---

## 🐛 Still Having Issues?

Check Render logs for these common errors:

| Error | Cause | Fix |
|-------|-------|-----|
| `❌ TG_BOT_TOKEN is not set!` | Missing env var | Add in Render Dashboard |
| `❌ ELEVENLABS_API_KEY is not set!` | Missing env var | Add in Render Dashboard |
| `ETIMEDOUT` | Network/API issue | Usually resolves on retry |
| `401 Unauthorized` | Invalid API keys | Check your keys are correct |

---

## 📦 Commit and Push Changes

```bash
git add .
git commit -m "fix: add error handling and Render env vars"
git push origin main
```

Render will auto-deploy when you push to `main`.
