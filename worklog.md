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
