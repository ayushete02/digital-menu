# Quick Start Guide

Get your Digital Menu Management System up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- A Neon PostgreSQL database (free tier works!)

## Setup in 5 Steps

### 1️⃣ Clone and Install

```bash
git clone https://github.com/ayushete02/digital-menu.git
cd digital-menu
npm install
```

### 2️⃣ Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your favorite editor
nano .env  # or code .env, vim .env, etc.
```

**Minimum required variables:**
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"
SESSION_SECRET="any-random-32-character-string-here-min"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Get your Neon database URL:**
1. Go to [neon.tech](https://neon.tech)
2. Sign up (free)
3. Create a new project
4. Copy the connection string
5. Paste it for both `DATABASE_URL` and `DIRECT_URL`

**Generate SESSION_SECRET:**
```bash
# Run this in your terminal
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3️⃣ Initialize Database

```bash
npm run db:push
```

This creates all the necessary tables in your Neon database.

### 4️⃣ Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5️⃣ Create Your First Menu

1. Click **"Restaurant Login"**
2. Enter your email address
3. Check your console/terminal for the 6-digit code
   - (Email sending requires SMTP setup, otherwise codes appear in logs)
4. Enter the code along with your name and country
5. Click **"New Restaurant"** to create your first restaurant
6. Add categories (e.g., "Starters", "Main Course", "Desserts")
7. Add dishes to each category
8. Click the QR code icon to view/download the menu QR code
9. Visit `/menu/your-restaurant-slug` to see the public menu!

## Common Issues

### "Cannot connect to database"
- ✅ Check `DATABASE_URL` is correct
- ✅ Ensure Neon database is not paused (free tier auto-pauses after inactivity)
- ✅ Verify connection string includes `?sslmode=require`

### "Verification code not received"
- ✅ Check your terminal/console - codes are logged there
- ✅ To enable email delivery, add SMTP settings (see .env.example)

### "Module not found" errors
- ✅ Run `npm install` again
- ✅ Delete `node_modules` and `.next`, then `npm install`

### TypeScript errors
- ✅ Run `npm run typecheck` to see detailed errors
- ✅ Ensure `generated/prisma` folder exists (run `npx prisma generate`)

## Optional: Email Setup

To send actual verification codes via email:

1. Use a Gmail account
2. Enable 2-Factor Authentication
3. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
4. Add to `.env`:
   ```env
   SMTP_EMAIL="your-email@gmail.com"
   SMTP_APP_PASSWORD="your-16-char-app-password"
   EMAIL_FROM_ADDRESS="noreply@yourdomain.com"
   ```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run typecheck    # Check TypeScript types
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio (database GUI)
```

## What's Next?

- 📖 Read the [full README](./README.md) for detailed information
- 🚀 Follow [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to Vercel
- ✅ Use [PRE-DEPLOYMENT-CHECKLIST.md](./PRE-DEPLOYMENT-CHECKLIST.md) before going live

## Need Help?

- Check [TROUBLESHOOTING](#common-issues) section above
- Review the comprehensive [README.md](./README.md)
- Open an issue on GitHub

---

**Happy building! 🎉**

Now go create some amazing digital menus! 🍕🍔🍜
