---
Task ID: 1
Agent: Main Agent
Task: Update certification badge to TikTok-style blue/white badge

Work Log:
- Analyzed all files using BadgeCheck/verification badge (6 files total)
- Created new reusable `VerifiedBadge` component at `/src/components/oppy/verified-badge.tsx`
  - TikTok-identical style: blue circle (#20D5EC) with white checkmark (Check icon, strokeWidth={3})
  - Supports 4 sizes: xs, sm, md, lg
- Updated `user-avatar.tsx`: replaced BadgeCheck with VerifiedBadge component
- Updated `ProfileScreen.tsx`: replaced inline BadgeCheck with VerifiedBadge size="lg"
- Updated `HomeScreen.tsx`: replaced 2 BadgeCheck usages (comment panel + feed card) with VerifiedBadge; also fixed "OPPY" → "OQUI" in header
- Updated `MessagesScreen.tsx`: replaced 2 BadgeCheck usages (chat header + conversation list) with VerifiedBadge
- Updated `opp-card.tsx`: replaced CheckCircle2 with VerifiedBadge
- Removed all `BadgeCheck` imports from lucide-react where no longer needed
- Verified lint passes clean
- Verified app compiles and serves (HTTP 200)

Stage Summary:
- All verification badges across the app now use TikTok-style blue (#20D5EC) circle with white checkmark
- Created reusable `VerifiedBadge` component for consistent styling
- Also fixed remaining "OPPY" reference in HomeScreen header to "OQUI"

---
Task ID: 2
Agent: Main Agent
Task: Integrate OTP email verification, forgot password system, and remove inappropriate emojis

Work Log:
- Installed nodemailer + @types/nodemailer
- Added GMAIL_USER and GMAIL_APP_PASSWORD to .env
- Added OtpCode model to Prisma schema (email, codeHash, purpose, expiresAt, isUsed)
- Ran db:push to sync database
- Created src/lib/email.ts — Nodemailer Gmail SMTP sender with OQUI-branded HTML template
  - Supports simulation mode when Gmail not configured (shows OTP in-app)
  - Supports real email sending via Gmail SMTP
- Created src/lib/auth.ts — OTP generation/verification logic
  - createOtp() — crypto-secure 6-digit OTP
  - initiateOtp() — store hashed OTP in DB + send email
  - verifyOtp() — verify code + mark as used
  - completeOtpLogin() — fetch user after login OTP verification
  - resetPassword() — change password after reset OTP verification
  - Fallback to in-memory store if DB unavailable
- Created API routes:
  - /api/v1/auth/otp (send + verify for login OTP)
  - /api/v1/auth/forgot-password (send + verify + reset)
  - /api/v1/auth/verify-email (send + verify for email verification)
- Rewrote LoginScreen.tsx with full OTP flow:
  - Step 1: email + password → Step 2: OTP verification
  - Simulation mode: yellow box shows OTP code + copy button
  - Real mode: message "Code envoyé à votre email"
  - Resend OTP with 60s countdown
  - Forgot Password dialog with 4 steps: email → OTP → new password → success
- Rewrote SignupScreen.tsx with email verification:
  - After account creation, automatically sends email verification OTP
  - Same OTP input UI with simulation/real mode support
  - Mark user as verified in DB upon successful verification
- Removed emojis from titles/buttons/toasts:
  - "Bon retour ! 👋" → "Bon retour"
  - "Rejoignez-nous ! 🚀" → "Rejoignez-nous"
  - "🚀 Essayer en mode démo" → "Essayer en mode démo"
  - Toast messages cleaned: removed 🎉 🔗 📞 📹
  - Kept emojis where appropriate: bios, comments, emoji picker
- Verified Gmail email sending works (actual emails sent successfully)
- Lint passes clean

Stage Summary:
- Full OTP system integrated: login verification, email verification, forgot password
- Gmail SMTP configured and working (blunaantoine@gmail.com)
- Simulation mode works when Gmail unavailable
- All inappropriate emojis removed from UI titles/buttons
- API endpoints tested and working: /api/v1/auth/otp, /forgot-password, /verify-email
