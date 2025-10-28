# Troubleshooting Guide

## 🔴 Error: 401 Unauthorized from ElevenLabs

### Symptoms
```
ElevenLabsError: Status code: 401
Body: {}
statusCode: 401
```

### Causes
1. **API key not set** on Render
2. **API key is incorrect** or has extra spaces
3. **API key has expired** or was regenerated
4. **Wrong environment variable name**

---

## ✅ Solution Steps

### Step 1: Verify API Key Format
ElevenLabs API keys should look like:
```
sk_abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzab5678cdef
```

- Must start with `sk_`
- Should be around 64 characters long
- No spaces before or after

### Step 2: Check Render Environment Variables

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Select your service**: `telegram-ttv-bot`
3. **Click "Environment" tab** (left sidebar)
4. **Verify variables exist**:
   - `ELEVENLABS_API_KEY` (name must be EXACT - case sensitive!)
   - `TG_BOT_TOKEN`
   - `NODE_ENV` = `production`

### Step 3: Check for Common Mistakes

#### ❌ Wrong variable name:
```
ELEVENLABS_API_KEY  ← Correct
ELEVENLABS_APIKEY   ← Wrong (missing underscore)
ELEVEN_LABS_API_KEY ← Wrong (extra underscore)
elevenlabs_api_key  ← Wrong (lowercase)
```

#### ❌ Extra spaces:
```
"sk_abc123..."    ← Correct
" sk_abc123..."   ← Wrong (space at start)
"sk_abc123... "   ← Wrong (space at end)
```

#### ❌ Wrong value:
```
sk_abc123...      ← Correct (actual key)
your_api_key_here ← Wrong (placeholder text)
```

### Step 4: Get New API Key from ElevenLabs

1. Go to: https://elevenlabs.io/app/settings/api-keys
2. Log in to your account
3. **Copy existing key** OR **Generate new key**
4. Copy the FULL key (including `sk_` prefix)

### Step 5: Update on Render

1. Render Dashboard → Environment tab
2. Find `ELEVENLABS_API_KEY`
3. Click **Edit** (pencil icon)
4. **Paste the new key** (Ctrl+V / Cmd+V)
5. Make sure NO SPACES before/after
6. Click **Save**
7. Render will auto-redeploy

### Step 6: Monitor Logs

After saving, check Render logs for:

✅ **Success:**
```
☁️  Using environment variables from Render
✅ TG_BOT_TOKEN loaded: 7629334141:AAH...
✅ ELEVENLABS_API_KEY loaded: sk_abc12...
🌐 Server running on port 10000
🔊 Initializing ElevenLabs client...
🤖 Launching Telegram bot...
✅ Telegram bot started successfully
✅ Application started successfully
```

❌ **Still failing:**
```
❌ ELEVENLABS_API_KEY is not set!
```
→ Variable name is wrong or not saved

---

## 🧪 Test Locally First

Before pushing to Render, test locally:

1. **Update your `.env` file:**
   ```bash
   nano .env
   ```

2. **Add/update the key:**
   ```
   ELEVENLABS_API_KEY=sk_your_new_key_here
   TG_BOT_TOKEN=7629334141:AAH...
   ```

3. **Run locally:**
   ```bash
   npm run start:dev:watch
   ```

4. **Check output:**
   ```
   🔧 Loading .env file (local development)
   ✅ TG_BOT_TOKEN loaded: 7629334141:AAH...
   ✅ ELEVENLABS_API_KEY loaded: sk_abc12...
   ```

5. **Test in Telegram:**
   - Send a message to your bot
   - Should receive voice message back
   - If 401 error → API key is invalid/expired

---

## 🔍 Debug Output Explanation

With the new debug logging, you'll see:

```bash
✅ ELEVENLABS_API_KEY loaded: sk_abc12...
```

This shows:
- ✅ Variable IS set
- `sk_` confirms it starts correctly
- First 8 characters help you verify it's the right key

If you see:
```bash
❌ ELEVENLABS_API_KEY is not set!
```
→ Variable is missing or empty

---

## 🆘 Still Not Working?

### Check API Key Validity Online

Test your API key with curl:
```bash
curl -X GET "https://api.elevenlabs.io/v1/user" \
  -H "xi-api-key: sk_your_key_here"
```

**Valid key response:**
```json
{"subscription": {...}, "is_new_user": false, ...}
```

**Invalid key response:**
```json
{"detail": {"status": "invalid_api_key"}}
```

### Check ElevenLabs Account

1. Go to: https://elevenlabs.io/app/settings
2. Verify account is active
3. Check if you have API access
4. Verify no billing issues

---

## 📝 Checklist

- [ ] API key starts with `sk_`
- [ ] No spaces before/after key
- [ ] Variable name is exactly `ELEVENLABS_API_KEY`
- [ ] Key is set in Render Dashboard → Environment tab
- [ ] Saved changes in Render (triggers auto-deploy)
- [ ] Logs show `✅ ELEVENLABS_API_KEY loaded: sk_...`
- [ ] No `401` errors in logs when sending messages
- [ ] Bot responds with voice messages

---

## Other Common Errors

### ETIMEDOUT (Telegram)
**Cause**: `TG_BOT_TOKEN` not set or incorrect  
**Fix**: Same steps as above for `TG_BOT_TOKEN`

### Server Error / Port Already in Use (Local)
**Cause**: Another process using port 3000  
**Fix**: Kill process or change port in `.env`: `PORT=3001`
