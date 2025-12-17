# Pre-Launch Testing Checklist - Bac Français 2026

Use this checklist before each deployment to ensure everything works correctly.

---

## 1. Authentication Flow

### Sign Up
- [ ] Create new account with email/password
- [ ] Verify email confirmation arrives
- [ ] Check profile is created in Supabase
- [ ] Verify onboarding redirects new users
- [ ] Analytics event `signup` is tracked

### Sign In
- [ ] Login with email/password works
- [ ] Google OAuth login works
- [ ] Session persists on page refresh
- [ ] Logout clears session completely
- [ ] Analytics event `login` is tracked

### Password Reset
- [ ] "Mot de passe oublié" sends reset email
- [ ] Reset link works and updates password

---

## 2. Subscription & Payments (Stripe)

### Free Tier
- [ ] New user has no active subscription
- [ ] Exercise limit (3/week) is enforced
- [ ] "Limite atteinte" message shows upgrade CTA
- [ ] Analytics event `limit_reached` is tracked

### Checkout Flow
- [ ] Premium monthly checkout creates session
- [ ] Premium annual checkout creates session
- [ ] Tutoring plans checkout works
- [ ] Trial period (1 day) is applied
- [ ] Success page redirects correctly
- [ ] Analytics event `checkout_started` is tracked

### Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Auth Required: 4000 0025 0000 3155
```

### Webhook
- [ ] `checkout.session.completed` updates subscription
- [ ] `customer.subscription.updated` syncs status
- [ ] `customer.subscription.deleted` cancels subscription
- [ ] `invoice.payment_failed` handles failure gracefully
- [ ] Idempotency: same event twice doesn't duplicate

### Customer Portal
- [ ] "Gérer mon abonnement" opens Stripe portal
- [ ] User can cancel subscription
- [ ] User can update payment method

---

## 3. AI Exercise Generation

### Subject Generation
- [ ] Generate single subject works
- [ ] Generate subject list (3 subjects) works
- [ ] All exercise types work:
  - [ ] Commentaire composé
  - [ ] Dissertation
  - [ ] Contraction-essai
  - [ ] Explication linéaire
- [ ] Rate limiting (20 req/min) triggers on excess
- [ ] Error handling shows user-friendly message

### Evaluation
- [ ] Submit work for correction
- [ ] Correction includes score and feedback
- [ ] Correction is saved to database
- [ ] Progress updates after evaluation

### Demo Mode (No API Key)
- [ ] Mock responses work when DEEPSEEK_API_KEY is missing
- [ ] UI indicates demo mode

---

## 4. Core Features

### Dashboard
- [ ] Stats load correctly (exercises, progress, etc.)
- [ ] Recent activity displays
- [ ] Skill progression widget shows
- [ ] Subscription banner shows for free users

### Methodology
- [ ] All methodology guides display
- [ ] Navigation between types works
- [ ] Content renders correctly (markdown/formatting)

### Programme (Works)
- [ ] All parcours display
- [ ] Work cards open detail modal
- [ ] Modal keyboard navigation (Escape, Tab trap)
- [ ] Focus returns to trigger on close

### Progression
- [ ] Skills chart displays
- [ ] Achievements show (locked/unlocked)
- [ ] Recommendations load

### Tutoring Calendar
- [ ] Calendar displays available slots
- [ ] Booking a session works (Premium+Tutoring only)
- [ ] Session appears in "Mes cours"

---

## 5. Teacher Mode

- [ ] Teacher can access /enseignant
- [ ] Can create class with code
- [ ] Students can join with code
- [ ] Class statistics display
- [ ] Can view student progress

---

## 6. Responsive Design

### Mobile (< 768px)
- [ ] Navigation hamburger menu works
- [ ] All pages scroll correctly
- [ ] Touch targets are at least 44px
- [ ] Cookie banner doesn't block content
- [ ] Forms are usable

### Tablet (768px - 1024px)
- [ ] Layout adapts appropriately
- [ ] Sidebar collapses if present

### Desktop (> 1024px)
- [ ] Full navigation visible
- [ ] No horizontal overflow

---

## 7. Accessibility

### Keyboard Navigation
- [ ] All interactive elements focusable with Tab
- [ ] Focus visible on all elements
- [ ] Skip link works (visible on focus)
- [ ] Modal focus trap works
- [ ] Escape closes modals

### Screen Reader
- [ ] All images have alt text or aria-hidden
- [ ] Buttons have accessible names
- [ ] Form fields have labels
- [ ] ARIA landmarks present (header, nav, main, footer)

### Color Contrast
- [ ] Text meets WCAG AA (4.5:1 ratio)
- [ ] UI elements meet 3:1 ratio

---

## 8. Legal & RGPD

### Cookie Consent
- [ ] Banner appears on first visit
- [ ] "Tout accepter" enables all cookies
- [ ] "Refuser les non-essentiels" disables analytics
- [ ] "Personnaliser" shows detailed options
- [ ] Choice persists on refresh
- [ ] Analytics respects consent setting

### Legal Pages
- [ ] /mentions-legales loads
- [ ] /cgv loads
- [ ] /confidentialite loads
- [ ] Footer links work
- [ ] Back button returns to previous page

---

## 9. Performance

### Load Time
- [ ] Initial load < 3s on 3G
- [ ] Time to Interactive < 5s
- [ ] Largest Contentful Paint < 2.5s

### Bundle Size
- [ ] JS bundle < 700KB gzipped
- [ ] CSS < 50KB gzipped
- [ ] No unused dependencies

### Caching
- [ ] Static assets have cache headers
- [ ] Service worker caches app shell (if PWA enabled)

---

## 10. Error Handling

### Network Errors
- [ ] Offline state shows appropriate message
- [ ] Failed API calls show toast notification
- [ ] Retry logic for transient failures

### Error Boundary
- [ ] Uncaught errors show friendly error page
- [ ] User can recover without page reload
- [ ] Errors are logged (if Sentry configured)

### Form Validation
- [ ] Invalid inputs show clear error messages
- [ ] Errors clear on correction
- [ ] Submit disabled until valid

---

## 11. Security

### Authentication
- [ ] Protected routes redirect to login
- [ ] Token refresh works (no sudden logout)
- [ ] Session expires appropriately

### API Security
- [ ] Backend validates JWT on protected routes
- [ ] Rate limiting active on AI routes
- [ ] CORS only allows production domain

### Data Protection
- [ ] No sensitive data in console logs
- [ ] Environment variables not exposed
- [ ] Stripe keys are secret (not publishable) on backend

---

## 12. Production Environment

### Environment Variables
Frontend (build-time):
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY
- [ ] VITE_API_URL
- [ ] VITE_STRIPE_PUBLISHABLE_KEY

Backend:
- [ ] PORT
- [ ] FRONTEND_URL
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] DEEPSEEK_API_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] STRIPE_PRICE_* (all price IDs)

### Health Checks
- [ ] /health returns 200 OK
- [ ] Database connection works
- [ ] Stripe API reachable

### Logging
- [ ] Requests logged with request ID
- [ ] Errors logged with stack trace
- [ ] No PII in logs

---

## 13. Pre-Deployment Verification

```bash
# Build frontend
cd frontend
npm run build
npm run preview  # Test production build locally

# Build backend
cd server
npm run build
npm start  # Test production build locally

# Run type checks
npm run typecheck

# Check for security vulnerabilities
npm audit
```

### Final Checks
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Stripe webhook configured for production URL
- [ ] DNS points to correct server
- [ ] SSL certificate valid

---

## Post-Deployment Verification

After deploying:

1. [ ] Visit https://app.neodromes.eu - loads without errors
2. [ ] Check https://api.neodromes.eu/health - returns OK
3. [ ] Create test account, complete onboarding
4. [ ] Generate one exercise
5. [ ] Test Stripe checkout (use test card)
6. [ ] Verify webhook received (check Stripe dashboard)
7. [ ] Test mobile view
8. [ ] Check error monitoring (Sentry) for any errors

---

## Rollback Plan

If critical issues found:

1. In Coolify: **Deployments** → Select previous version → **Rollback**
2. Verify rollback successful via health check
3. Investigate logs for root cause
4. Fix and redeploy

---

*Last updated: December 2024*
