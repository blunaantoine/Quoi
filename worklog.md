---
Task ID: 1
Agent: Main Agent
Task: Fix image upload button and add dark/light mode toggle

Work Log:
- Explored project structure: identified Next.js 16 + TypeScript project with shadcn/ui
- Found AddScreen.tsx image upload was simulated with hardcoded Unsplash URL
- Found no dark/light mode toggle existed in Settings panel
- Created `/api/upload` route with POST (file upload) and GET (file serving) handlers
- Updated AddScreen.tsx with real file input, FileReader preview, file validation (type/size), upload status, and remove image button
- Added light theme CSS variables in globals.css `:root` section
- Updated layout.tsx to enable system preference and remove forced dark class
- Created ThemeToggle component using `useSyncExternalStore` to avoid hydration/lint issues
- Added "Apparence" section to Settings panel with Sun/Moon toggle
- Updated all screen components (HomeScreen, NewsScreen, MessagesScreen, AddScreen, ProfileScreen) to use theme-aware Tailwind classes
- Updated all oppy components (search-overlay, notifications-panel, ad-overlay, etc.) with theme-aware classes
- Added allowedDevOrigins config for cross-origin preview access
- Fixed Caddyfile to use 127.0.0.1 instead of localhost (IPv6 resolution issue)

Stage Summary:
- Image upload now uses real `<input type="file">` with FileReader preview + API upload
- Dark/Light mode toggle added in Settings > Apparence section
- All components updated to use CSS variables for theme support
- Server running with auto-restart capability
