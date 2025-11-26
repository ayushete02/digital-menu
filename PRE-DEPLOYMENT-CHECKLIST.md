# Pre-Deployment Checklist

Complete this checklist before deploying to production.

## Code Quality

- [x] TypeScript compilation passes (`npm run typecheck`)
- [x] No ESLint errors
- [x] All components have proper error boundaries
- [x] Loading states implemented for async operations
- [x] Form validation with clear error messages
- [x] Input sanitization to prevent XSS
- [x] Proper error handling in API routes

## Security

- [x] Environment variables properly configured
- [x] Session tokens use httpOnly cookies
- [x] Rate limiting on authentication endpoints
- [x] Image URLs validated (HTTPS + domain whitelist)
- [x] SQL injection prevented (using Prisma)
- [x] Security headers configured in `next.config.js`
- [x] No sensitive data in client-side code
- [x] `.env` file in `.gitignore`

## Database

- [x] Prisma schema matches requirements
- [x] Indexes on frequently queried fields
- [x] Foreign key constraints properly set
- [x] Cascade deletes configured
- [x] Connection pooling configured (Neon)
- [ ] Database backup strategy defined
- [ ] Migration files reviewed

## Functionality

- [x] User registration with email OTP
- [x] Email verification flow works
- [x] Session persistence (30 days)
- [x] Restaurant CRUD operations
- [x] Category management with hierarchy
- [x] Dish management with multi-category assignment
- [x] Public menu accessible without auth
- [x] QR code generation
- [x] Copy-to-clipboard share links

## UI/UX

- [x] Mobile-responsive design
- [x] Sticky header on menu page
- [x] Floating navigation button
- [x] Active section highlighting
- [x] Smooth scrolling
- [x] Loading skeletons
- [x] Toast notifications
- [x] Empty states with helpful messages
- [x] 404 pages for invalid routes
- [x] Error boundaries for crashes

## Performance

- [x] Image optimization configured in `next.config.js`
- [x] Lazy loading for images
- [x] Database queries optimized with proper selects
- [x] Indexes on foreign keys
- [x] React Query caching configured
- [ ] Performance tested with Lighthouse
- [ ] Bundle size analyzed

## Deployment

- [ ] Neon database created and configured
- [ ] Environment variables set in Vercel
- [ ] `NEXT_PUBLIC_APP_URL` set to production URL
- [ ] Vercel Authentication disabled for production
- [ ] Database schema pushed to production
- [ ] SSL certificate configured (automatic with Vercel)
- [ ] Custom domain configured (if applicable)
- [ ] DNS records updated (if using custom domain)

## Documentation

- [x] README.md complete with all required sections
- [x] .env.example up to date
- [x] DEPLOYMENT.md with deployment steps
- [x] CONTRIBUTING.md for contributors
- [x] LICENSE file added
- [x] Code comments for complex logic

## Testing

- [ ] Manual testing of complete user flows
  - [ ] Registration and login
  - [ ] Create restaurant
  - [ ] Add categories
  - [ ] Add dishes
  - [ ] View public menu
  - [ ] QR code generation
- [ ] Test on different devices
  - [ ] Mobile (iOS/Android)
  - [ ] Tablet
  - [ ] Desktop
- [ ] Test on different browsers
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Test error scenarios
  - [ ] Invalid login code
  - [ ] Expired verification code
  - [ ] Network failures
  - [ ] Invalid menu slug
  - [ ] Missing required fields

## Final Checks

- [ ] Remove console.log statements (or leave intentional ones only)
- [ ] Remove commented-out code
- [ ] Update README with deployed URL
- [ ] Test all functionality on production deployment
- [ ] Monitor Vercel logs for errors
- [ ] Verify email delivery (or console logging)
- [ ] Test QR code scanning with actual device
- [ ] Verify public menus load without authentication

## Post-Deployment

- [ ] Share deployment URL with stakeholders
- [ ] Monitor error tracking (Vercel dashboard)
- [ ] Set up uptime monitoring (optional)
- [ ] Create backup of initial database state
- [ ] Document any issues encountered
- [ ] Plan for future improvements

---

**Notes:**
- Items marked with `[x]` are completed
- Items marked with `[ ]` should be completed before going live
- Some items are optional but recommended for production quality

**Last Updated:** November 26, 2025
