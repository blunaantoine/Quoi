# Task 2-b: OPPY Shared UI Components

## Summary
Created all 7 shared UI components + mock data for the OPPY social network application.

## Files Created

### 1. `/home/z/my-project/src/lib/mock-data.ts`
Complete mock data file containing:
- 8 type definitions (Category, OppUser, OppPost, Article, Message, Conversation, Notification, Ad)
- 8 categories with icons/colors (concours, bourses, formations, stages, emplois, événements, financements, conférences)
- 9 mock opportunity posts across all categories
- 6 mock articles with varying event statuses
- 7 mock users (including current user with verified badge)
- 4 mock conversations with message threads
- 7 mock notifications (like, comment, follow, mention, opportunity)
- 2 mock ads
- Helper function `getCategory()`

### 2. `/home/z/my-project/src/components/oppy/user-avatar.tsx`
- Circular avatar with `next/image`
- Online indicator (green dot, bottom-right)
- Verified badge (lime #D1F550 background with BadgeCheck icon)
- Three sizes: sm (32px), md (40px), lg (56px)
- All sizes scale badges and indicators proportionally

### 3. `/home/z/my-project/src/components/oppy/category-badge.tsx`
- Colored pill badge using category config
- Lucide icon + label
- Category-specific colors (amber for concours, emerald for bourses, sky for formations, etc.)
- Border matches category color theme

### 4. `/home/z/my-project/src/components/oppy/search-bar.tsx`
- Rounded input with search icon
- Dark styled (bg-[#262626], border-[#333333])
- Focus ring with lime accent
- Clear button (X) appears when text is entered
- French placeholder text

### 5. `/home/z/my-project/src/components/oppy/empty-state.tsx`
- Reusable component accepting any Lucide icon
- Icon in rounded dark container
- Title + description
- Centered layout with consistent spacing

### 6. `/home/z/my-project/src/components/oppy/opp-card.tsx`
- Full-screen card with flyer image as background
- Gradient overlay (from black via 60% to transparent)
- Category badge + mode badge (En ligne/Présentiel/Hybride with color coding)
- Title, description, location, deadline countdown
- Deadline badge turns red when urgent (≤5 days)
- Tags: Nouveau (lime), Urgent (red), Vérifié (emerald) with icons
- External link CTA button (lime background)
- Right side action bar: like, comment, share, save with counts
- Like & save toggle with framer-motion scale animation
- Double-tap to like with large heart animation (AnimatePresence)
- Author row: avatar + name + verified checkmark
- Custom `useDeadline` hook for countdown logic

### 7. `/home/z/my-project/src/components/oppy/article-card.tsx`
- Horizontal card with image thumbnail (rounded)
- Event status badge (À venir=lime, En cours=emerald, Terminé=gray)
- Date with clock icon
- Title (2-line clamp) + excerpt (2-line clamp)
- Author avatar + name
- Views count (with k/M formatting) + comment count
- Hover border highlight with lime accent

### 8. `/home/z/my-project/src/components/oppy/ad-overlay.tsx`
- Full-screen overlay with dark backdrop + blur
- Centered card with spring entrance animation (framer-motion)
- Close button (X) top-right
- "Sponsorisé" label top-left
- Ad image with gradient overlay
- Title, description, sponsor name
- CTA button (lime)
- Auto-close after 5 seconds
- Click outside to close

## Showcase Page
Updated `src/app/page.tsx` with three tabs:
- **Fil**: TikTok-style full-screen feed with navigation arrows
- **Articles**: Article list with search bar + empty state
- **Composants**: Showcases all component variants (badges, avatars in all sizes, search bar, empty state, ad overlay trigger)

## Design Tokens Used
- Brand/Lime: `#D1F550`
- Dark BG: `#0A0A0A`
- Card BG: `#1A1A1A`
- Surface: `#262626`
- Text Primary: `white`
- Text Secondary: `#A3A3A3`
- Border: `#333333`

## Lint Status
✅ 0 errors, 0 warnings in oppy components (2 pre-existing warnings in unrelated file)
