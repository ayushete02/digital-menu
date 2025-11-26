# Digital Menu Management System

QR-first restaurant menu builder built with the T3 stack. Restaurateurs can manage locations, categories, and dishes, then share a responsive digital menu via link or QR code.

## Live Deployment

- **Vercel URL:** `TODO: add deployed link once the app is published`
	- Make sure Vercel authentication is disabled so guests can access menus without logging in.

## Local Development

```bash
# install dependencies
npm install

# run Prisma migrations against your Neon database
npm run db:push          # or npm run db:migrate once migrations are generated

# start the dev server
npm run dev

# type safety guardrail
npm run typecheck
```

### Environment Variables

Create a `.env` file based on `.env.example` and configure:

- `DATABASE_URL` – Neon PostgreSQL connection string
- `SESSION_SECRET` – long random string for HMAC + session signing
- `RESEND_API_KEY` *(optional)* – enable transactional email for login codes
- `EMAIL_FROM_ADDRESS` *(optional)* – custom from address when using Resend
- `NEXT_PUBLIC_APP_URL` – canonical URL (used for QR/link generation during SSR)

## Architecture & Approach

- **T3 Stack foundation**: Next.js 15 (App Router) + tRPC + Prisma + Tailwind, with shadcn/ui for composable primitives.
- **Email-based auth without NextAuth**: Login flow issues one-time codes backed by Prisma models (`VerificationCode`, `Session`). Sessions persist via httpOnly cookies.
- **Restaurant hierarchy**: Users own restaurants, each with nested categories (`Category` with self-relation) and many-to-many dishes (`DishCategory`). Zod validation keeps mutations safe.
- **Public menu experience**: `/menu/[slug]` renders a sticky, floating navigation experience that mirrors the provided UI references. IntersectionObserver powers dynamic section highlighting.
- **QR distribution**: Dashboard generates share links and on-demand QR codes (SVG) so staff can download or copy for printing/embedding.
- **Client/server data flow**: Server components use `appRouter.createCaller` for RSC-friendly data fetching. Client components lean on `@trpc/react-query` with optimistic feedback and toast notifications.

## Feature Highlights

- Email OTP authentication with optional profile enrichment (name + country)
- Multi-restaurant dashboard with creation dialog and session-aware routing
- Category & dish management including multi-category assignment per dish
- Public menu page with sticky active section indicator and floating navigator
- QR code dialog with SVG download + share link copy helper
- Resend fallback logging prints login codes in development for fast QA

## Tooling & Workflow Notes

- **IDE**: Visual Studio Code
- **Primary packages**: `next`, `@trpc/server`, `@tanstack/react-query`, `prisma`, `tailwindcss`, `react-qr-code`, `lucide-react`, `shadcn/ui`
- **Code quality**: Strict TypeScript config, Prisma generated client colocated in `generated/prisma`, `npm run typecheck` gate

## AI Assistance Log

- **Model & tool**: GitHub Copilot (GPT-5-Codex Preview)
- **Notable prompts**:
	- _"Fix typecheck errors by removing leftover post router"_
	- _"Add QR code dialog to dashboard cards"_
	- _"Normalize form data before calling tRPC mutations"_
- **Value add**: Accelerated boilerplate wiring (e.g., QR dialog) and highlighted schema mismatches. Required manual corrections around Zod preprocessing and React Hook Form typing where AI suggestions were too optimistic.

## Edge Cases Considered

- Prevent reuse of consumed/expired verification codes and prune stale entries
- Enforce category ownership before dish association to avoid cross-tenant leaks
- Handle empty menu states gracefully (no categories or dishes yet)
- Convert blank optional fields to `undefined` before Prisma mutations to avoid invalid data
- Clipboard API errors fallback with user-facing toast messages

## Deferred Items / Next Steps

- Bulk editing & reordering for dishes/categories (drag-and-drop roadmap)
- Menu theming options per restaurant (colors, accent text)
- Analytics on menu views and top-performing dishes
- Accessibility audit for color contrast + keyboard navigation on the public menu

## Deployment Checklist

1. Provision Neon Postgres database and update `DATABASE_URL`
2. Generate Prisma client: `npm run db:push`
3. Configure Vercel project with required environment variables
4. Set `NEXT_PUBLIC_APP_URL` to the Vercel domain
5. Trigger build (`npm run build`) locally or via Vercel deployment
6. Publish QR links and update README with the live URL

## Assignment Footnotes

- **Approach summary**: Leaned on server components for auth-sensitive screens, pushed business logic into tRPC routers, and mirrored the design reference with Tailwind + shadcn/ui.
- **AI reflection**: GPT-5-Codex sped up iteration but required vigilance—particularly around Zod/React Hook Form interplay and Prisma type imports.
- **Please update** the deployment URL and any organisation-specific notes before submitting the repository link.
