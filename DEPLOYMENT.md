# Deployment Guide

This guide covers deploying the Digital Menu Management System to Vercel.

## Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Neon Database** - Create a PostgreSQL database at [neon.tech](https://neon.tech)

## Step-by-Step Deployment

### 1. Set Up Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it should look like `postgresql://user:password@host/db`)
4. Keep both the pooled and direct connection strings

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://user:password@host/db?sslmode=require
   DIRECT_URL=postgresql://user:password@host/db?sslmode=require
   SESSION_SECRET=your-32-char-random-secret
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

   Optional (for email):
   ```
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   SMTP_EMAIL=your-gmail@gmail.com
   SMTP_APP_PASSWORD=your-16-char-app-password
   ```

5. Click **Deploy**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow the prompts
# Set environment variables when prompted
```

### 3. Initialize Database Schema

After deployment, push your Prisma schema:

```bash
# Set DATABASE_URL in your terminal
export DATABASE_URL="your-neon-connection-string"

# Push schema
npx prisma db push

# Or create a migration
npx prisma migrate deploy
```

Alternatively, use Vercel's deployment hooks or run this in your Vercel dashboard terminal.

### 4. Disable Vercel Authentication

⚠️ **IMPORTANT**: Public menus must be accessible without login!

1. Go to your project settings in Vercel
2. Navigate to **Deployment Protection**
3. Ensure **Vercel Authentication** is **OFF** for production
4. You can enable it for preview deployments if needed

### 5. Configure Custom Domain (Optional)

1. Go to project **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### 6. Verify Deployment

1. Visit your deployed URL
2. Test the login flow (check email or console for code)
3. Create a test restaurant
4. Add categories and dishes
5. Visit the public menu: `https://your-app.vercel.app/menu/your-restaurant-slug`
6. Test QR code generation

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | Neon PostgreSQL connection string (pooled) |
| `DIRECT_URL` | ✅ Yes | Neon PostgreSQL connection string (direct) |
| `SESSION_SECRET` | ✅ Yes | Random string (min 32 chars) for session encryption |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Your app's public URL (e.g., `https://your-app.vercel.app`) |
| `EMAIL_FROM_ADDRESS` | ⚠️ Optional | Custom "from" address for emails |
| `SMTP_EMAIL` | ⚠️ Optional | Gmail address for sending emails |
| `SMTP_APP_PASSWORD` | ⚠️ Optional | Gmail App Password (16 chars) |

## Generating Secrets

### SESSION_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Gmail App Password

1. Enable 2-Factor Authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Create a new app password for "Mail"
4. Copy the 16-character password (no spaces)

## Troubleshooting

### Build Fails

**Error: `Cannot find module`**
- Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: `Prisma Client generation failed`**
- Check `DATABASE_URL` format
- Ensure `prisma generate` runs in `postinstall` script

### Database Connection Issues

**Error: `connect ECONNREFUSED`**
- Verify `DATABASE_URL` is correct
- Ensure Neon database is not paused (free tier auto-pauses)
- Check IP whitelist (Neon allows all IPs by default)

**Error: `SSL connection required`**
- Add `?sslmode=require` to connection string

### Email Not Sending

If SMTP credentials are not configured:
- Codes are logged to Vercel logs (accessible in dashboard)
- Check **Deployment** → **Logs** for verification codes
- For production, configure Gmail SMTP or use a service like SendGrid

### Public Menu Not Accessible

- Verify **Vercel Authentication** is disabled
- Check that menu slug exists in database
- Test with browser incognito mode

### QR Code Not Displaying

- Ensure `NEXT_PUBLIC_APP_URL` is set correctly
- Check browser console for errors
- Verify `react-qr-code` package is installed

## Performance Optimization

### Enable Edge Runtime (Optional)

For faster response times, consider using Edge Runtime for API routes:

```typescript
// app/api/your-route/route.ts
export const runtime = 'edge';
```

### Add Caching Headers

Vercel automatically caches static assets. For API routes, add cache headers:

```typescript
return new Response(JSON.stringify(data), {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
  }
});
```

## Monitoring

### View Logs

```bash
# Using Vercel CLI
vercel logs
```

Or visit **Deployment** → **Logs** in Vercel dashboard.

### Analytics

Enable Vercel Analytics in project settings for:
- Page views
- Web Vitals
- Performance metrics

## Rollback

If a deployment breaks production:

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

Or use the Vercel dashboard: **Deployments** → **Promote to Production**

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Project Issues**: [GitHub Issues](https://github.com/ayushete02/digital-menu/issues)

---

**Happy Deploying! 🚀**
