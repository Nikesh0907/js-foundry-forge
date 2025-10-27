# TalentFlow - Modern Hiring Platform

A comprehensive React-based hiring platform for managing jobs, candidates, and assessments.

## 🚀 Project Overview

TalentFlow is a mini hiring platform built with React, TypeScript, and modern web technologies. It provides HR teams with powerful tools to:

- **Manage Jobs**: Create, edit, archive, and reorder job postings
- **Track Candidates**: View 1000+ candidates with virtualized lists, move them through hiring stages
- **Build Assessments**: Create custom evaluation forms with multiple question types

## 🏗️ Architecture & Project Structure

```
src/
├── components/
│   ├── jobs/              # Job-related components
│   ├── candidates/        # Candidate management components  
│   ├── assessments/       # Assessment builder & runtime
│   ├── layout/            # App layout & navigation
│   └── ui/                # Shadcn UI components
├── lib/
│   ├── api/               # MSW mock API handlers
│   ├── db/                # Dexie IndexedDB setup & seed data
│   └── utils.ts           # Utility functions
├── hooks/                 # Custom React hooks
├── pages/                 # Main route pages
├── types/                 # TypeScript type definitions
└── index.css              # Design system & global styles
```

## 🎨 Design System

TalentFlow uses a professional design system with:

- **Primary Color**: Indigo (#6366F1) for a modern tech feel
- **Accent Color**: Vibrant purple (#A855F7) for CTAs
- **Status Colors**: Green (success), Orange (warning), Red (destructive), Blue (info)
- **Typography**: Clean, readable fonts with consistent hierarchy
- **Components**: Built on Shadcn UI with custom variants

All colors use HSL format and are defined as CSS variables in `src/index.css`.

## 🛠️ Technologies

### Core Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library

### State & Data
- **TanStack Query** - Server state management
- **Dexie.js** - IndexedDB wrapper for local persistence
- **MSW (Mock Service Worker)** - API mocking

### Advanced Features
- **@dnd-kit** - Drag-and-drop for job reordering & kanban
- **@tanstack/react-virtual** - Virtualized lists for 1000+ candidates
- **React Router** - Client-side routing

## 📦 Installation & Setup

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Key Features Implementation

### 1. Mock API Layer (MSW)
Located in `src/lib/api/`, MSW simulates a REST API with:
- Artificial latency (200-1200ms)
- 5-10% error rate for testing error handling
- Full CRUD operations for jobs, candidates, assessments

### 2. Local Persistence (IndexedDB)
- All data stored in IndexedDB via Dexie
- Automatic seeding with 25 jobs + 1000 candidates
- State persists across page refreshes

### 3. Jobs Management
- Server-like pagination & filtering
- Drag-and-drop reordering with optimistic updates
- Archive/unarchive functionality
- Deep linking: `/jobs/:jobId`

### 4. Candidates Pipeline
- Virtualized list for performance with 1000+ records
- Client-side search (name/email) + server-like filtering
- Kanban board for stage transitions
- Timeline view of candidate history

### 5. Assessment Builder (Planned)
- Multi-question types: single/multi-choice, text, numeric, file upload
- Live preview pane
- Conditional question logic
- Validation rules (required, ranges, max length)

## 🎯 API Endpoints (Mocked)

```
GET    /api/jobs?search=&status=&page=&pageSize=
POST   /api/jobs
PATCH  /api/jobs/:id
PATCH  /api/jobs/:id/reorder

GET    /api/candidates?search=&stage=&page=
PATCH  /api/candidates/:id
GET    /api/candidates/:id/timeline

GET    /api/assessments/:jobId
PUT    /api/assessments/:jobId
POST   /api/assessments/:jobId/submit
```

## 📝 Technical Decisions

### Why MSW over Mock Data?
- Simulates real network conditions (latency, errors)
- Easy transition to real API
- Supports optimistic updates & error handling patterns

### Why Dexie (IndexedDB)?
- Persistent storage across sessions
- Handles large datasets (1000+ candidates)
- Better performance than localStorage
- Supports complex queries

### Why Virtual Lists?
- Rendering 1000+ DOM nodes causes performance issues
- Virtual lists only render visible items
- Smooth scrolling even with massive datasets

### Component Structure
- Small, focused components over monolithic files
- Clear separation of concerns (UI, logic, data)
- Reusable UI components via Shadcn

## 🚧 Known Limitations

1. **Assessment Builder**: Not yet implemented (placeholder UI ready)
2. **Drag-and-Drop**: Job reordering in planning stage
3. **Real-time Updates**: No WebSocket support (mock API only)
4. **File Upload**: Stub implementation for assessments

## 🔮 Future Enhancements

- [ ] Complete assessment builder with live preview
- [ ] Candidate kanban board with drag-and-drop
- [ ] Notes with @mentions
- [ ] Export candidates to CSV
- [ ] Email integration
- [ ] Calendar integration for interviews
- [ ] Analytics dashboard

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [MSW Documentation](https://mswjs.io)
- [Dexie.js Guide](https://dexie.org)

---

Built with ❤️ using React + TypeScript + Vite
