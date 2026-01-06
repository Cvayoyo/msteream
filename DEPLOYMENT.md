# Panduan Deployment untuk Production dan Staging

## Prerequisites

Pastikan Anda sudah menginstall dependencies:
```bash
npm install
```

## Environment Variables

Buat file `.env.local` atau `.env.production` dengan variabel berikut:

```env
# API URL
NEXT_PUBLIC_API_URL=https://your-api-url.com

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database (jika menggunakan Prisma)
DATABASE_URL=your-database-url
```

## Build untuk Production

### 1. Build Production
```bash
npm run build
```

Perintah ini akan:
- Mengoptimalkan semua assets
- Membuat production-ready build di folder `.next`
- Menjalankan optimizations untuk performance

### 2. Start Production Server
```bash
npm start
```

Server akan berjalan di `http://localhost:3000` (default port)

### 3. Custom Port
```bash
PORT=3001 npm start
```

## Staging Environment

### Option 1: Menggunakan .env.local (Recommended)

1. Buat file `.env.local` untuk development/staging:
```env
NEXT_PUBLIC_API_URL=https://staging-api-url.com
NEXTAUTH_URL=https://staging.yourdomain.com
NEXTAUTH_SECRET=your-staging-secret
DATABASE_URL=your-staging-database-url
```

2. Build dan start seperti biasa:
```bash
npm run build
npm start
```

### Option 2: Menggunakan Environment Variables Langsung

```bash
# Windows PowerShell
$env:NEXT_PUBLIC_API_URL="https://staging-api-url.com"; $env:NEXTAUTH_URL="https://staging.yourdomain.com"; npm run build

# Windows CMD
set NEXT_PUBLIC_API_URL=https://staging-api-url.com && set NEXTAUTH_URL=https://staging.yourdomain.com && npm run build

# Linux/Mac
NEXT_PUBLIC_API_URL=https://staging-api-url.com NEXTAUTH_URL=https://staging.yourdomain.com npm run build
```

### Option 3: Menggunakan cross-env (Cross-platform)

1. Install cross-env:
```bash
npm install -D cross-env
```

2. Tambahkan script di package.json:
```json
{
  "scripts": {
    "build:staging": "cross-env NEXT_PUBLIC_API_URL=https://staging-api-url.com npm run build",
    "start:staging": "cross-env NEXT_PUBLIC_API_URL=https://staging-api-url.com npm start"
  }
}
```

3. Run:
```bash
npm run build:staging
npm run start:staging
```

## Production Deployment

### Option 1: Vercel (Recommended untuk Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Docker
Buat file `Dockerfile`:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

Build dan run:
```bash
docker build -t anime-app .
docker run -p 3000:3000 anime-app
```

### Option 3: PM2 (Process Manager)
```bash
# Install PM2
npm install -g pm2

# Start dengan PM2
pm2 start npm --name "anime-app" -- start

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup
```

## Scripts yang Tersedia

- `npm run dev` - Development mode dengan hot reload
- `npm run build` - Build untuk production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Tips

1. **Environment Variables**: Pastikan semua environment variables sudah di-set sebelum build
2. **Database**: Pastikan database connection sudah benar
3. **API URL**: Pastikan `NEXT_PUBLIC_API_URL` mengarah ke API yang benar
4. **Security**: Jangan commit file `.env` ke repository
5. **Performance**: Gunakan `npm run build` untuk optimasi production

## Troubleshooting

### Build Error
- Pastikan semua dependencies terinstall: `npm install`
- Cek environment variables sudah lengkap
- Cek console untuk error messages

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Memory Issues
Tingkatkan Node.js memory limit:
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```
