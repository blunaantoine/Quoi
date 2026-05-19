# Task 9 - Backend API Routes for OPPY

## Work Completed: 2026-03-05

### Summary
Created 13 API route files and 1 seed script for the OPPY social network backend.

### Files Created

#### API Routes (13 files)

1. **`/src/app/api/posts/route.ts`**
   - `GET` — List posts with pagination, category filter, status filter (default: approved). Includes author profile, category, likes count, comments count.
   - `POST` — Create a new post. If user role is "user", status = "pending"; if "certified" or above, status = "approved".

2. **`/src/app/api/posts/[id]/route.ts`**
   - `GET` — Get single post with full details (author, profile, category, comments, likes, savedBy). Increments view count.
   - `PUT` — Update post (only by author or admin/manager). Supports partial updates.
   - `DELETE` — Delete post (only by author or admin/manager). Requires userId query param.

3. **`/src/app/api/posts/[id]/like/route.ts`**
   - `POST` — Toggle like on a post. Body: `{ userId }`. Returns `{ liked: boolean, likesCount: number }`. Creates notification for post author on like.

4. **`/src/app/api/posts/[id]/save/route.ts`**
   - `POST` — Toggle save on a post. Body: `{ userId }`. Returns `{ saved: boolean }`.

5. **`/src/app/api/posts/[id]/comments/route.ts`**
   - `GET` — Get comments for a post, including author profiles, ordered by newest first.
   - `POST` — Add comment to a post. Body: `{ content, authorId }`. Creates notification for post author.

6. **`/src/app/api/categories/route.ts`**
   - `GET` — List all categories with post counts, ordered alphabetically.

7. **`/src/app/api/articles/route.ts`**
   - `GET` — List articles with optional filters (status, eventStatus).
   - `POST` — Create article (admin/manager only). Body: `{ title, content, images?, status?, eventStatus?, authorId }`.

8. **`/src/app/api/users/route.ts`**
   - `GET` — Search users by query param `q` (searches username, email, displayName). Passwords excluded from response.
   - `POST` — Register user. Creates user with profile. Passwords hashed with SHA-256.

9. **`/src/app/api/users/[id]/route.ts`**
   - `GET` — Get user profile with stats (posts, following, followers, comments, likes, savedPosts counts).
   - `PUT` — Update user profile. Supports updating both user fields (email, username, role, etc.) and profile fields (displayName, bio, avatar, etc.).

10. **`/src/app/api/users/[id]/follow/route.ts`**
    - `POST` — Toggle follow. Body: `{ followerId }`. Returns `{ following: boolean }`. Creates notification on follow.

11. **`/src/app/api/notifications/route.ts`**
    - `GET` — Get notifications for user (query: userId). Returns notifications and unreadCount.
    - `PUT` — Mark notifications as read. Body: `{ userId, notificationId? }`. If notificationId provided, marks single; otherwise marks all as read.

12. **`/src/app/api/ads/route.ts`**
    - `GET` — Get active ads (isActive=true, startDate <= now, endDate >= now or null).
    - `POST` — Create ad (admin only). Body: `{ title, image, link?, type?, targetAudience?, startDate?, endDate?, authorId }`.

13. **`/src/app/api/auth/route.ts`**
    - `POST` — Login (default) or Register (action=register). Returns `{ user, token }`. Passwords hashed with SHA-256. Checks for banned/inactive accounts on login.

#### Seed Script

14. **`/prisma/seed.ts`**
    - Cleans all existing data before seeding
    - Creates 8 categories (concours, bourses, formations, stages, emplois, evenements, financements, conferences)
    - Creates 11 users:
      - 1 admin (admin@oppy.com / admin123)
      - 2 managers (manager1@oppy.com, manager2@oppy.com / password123)
      - 3 certified users (karim, ibrahim, amina @oppy.com / password123)
      - 5 regular users (fatou, aicha, omar, kadiatou, moussa @oppy.com / password123)
    - Creates 9 posts (8 approved + 1 pending) matching mock-data.ts content
    - Creates 6 articles (5 published + 1 draft)
    - Creates sample likes, comments, follows, notifications, saved posts, and 2 ads

15. **`package.json`** — Added `"db:seed": "bun run prisma/seed.ts"` script

### Technical Details
- All routes use Next.js 16 Route Handlers with `export async function GET/POST/PUT/DELETE`
- Dynamic route params use the Next.js 16 Promise pattern: `{ params }: { params: Promise<{ id: string }> }`
- Password hashing uses Node.js `crypto.createHash("sha256")`
- All database operations use `import { db } from "@/lib/db"` (Prisma Client)
- Proper error handling with try/catch and appropriate HTTP status codes
- Passwords always excluded from API responses via destructuring
- Notifications auto-created for likes, comments, and follows
- View count auto-incremented on post GET

### Verification
- TypeScript compilation: No errors in API routes or seed file
- Seed script ran successfully: All data populated
- Database push: Schema already in sync
