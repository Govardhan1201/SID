# IdeaForge - Platform Context for AI Assistants

This document provides a comprehensive overview of the **IdeaForge** platform. It is explicitly designed to be fed into LLMs or AI assistants to give them full context on the application's architecture, tech stack, data models, and features.

## 1. Project Overview
**IdeaForge** is a platform where engineering students showcase hackathon projects, submit ideas, form teams, and get discovered by top recruiters. It solves the problem of "resumes not reflecting real skills" by allowing students to build a live portfolio, and gives recruiters a way to discover talent based on actual builds and tech stacks.

## 2. Tech Stack
- **Framework:** Next.js (App Router, React 18)
- **Language:** TypeScript
- **Styling:** Vanilla CSS Modules with custom CSS variables (No Tailwind). Emphasizes modern, glassmorphic UI, smooth micro-animations, and dynamic interactions.
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Icons:** Lucide React

## 3. Core Features
- **Student Portfolios:** Students can add their skills, domains, GitHub, LinkedIn, bio, and showcase their projects.
- **Recruiter Dashboard:** Recruiters can browse portfolios, filter by tech stack/domain, view match scores, and shortlist candidates.
- **Project Showcase:** Students upload projects with GitHub links, live demos, and descriptions. Projects support version tracking and likes/comments.
- **Idea Submission:** Students can submit concepts to gather feedback and form teams before building.
- **Team Formation:** Users can create open or invite-only teams to collaborate on projects or hackathons.
- **Hackathons:** Admins can host hackathons with deadlines, rules, and submission portals.
- **Real-time Interactions:** The app includes a messaging system for direct peer-to-peer or recruiter-to-student communication, as well as a robust notification system.

## 4. Database Schema (Prisma)
The database is heavily relational. Key models include:
- **User:** Base authentication model (`role`: 'student', 'recruiter', 'admin').
- **StudentProfile / RecruiterProfile:** 1-to-1 extensions of `User` containing role-specific data.
- **Project:** Created by students. Contains `techStack`, `githubLink`, `liveLink`, and relations to `comments` and `likes`.
- **Idea:** Similar to projects but for concepts. Can be linked to a future `Project`.
- **Team:** Has a `leader` and multiple `members` (Users). Can be linked to a `Project` or `Hackathon`.
- **Hackathon:** Managed by admins. Contains `deadline`, `tracks`, and accepts `Project` submissions.
- **Message:** Direct messaging between two users (`senderId`, `receiverId`, `content`, `isRead`).
- **Notification:** System alerts (`type`: 'like', 'comment', 'message', 'invite', etc.).

## 5. Route Structure (App Router)
- `/` - Landing page with dynamic terminal animation and value proposition.
- `/explore` - Main discovery hub for projects, ideas, and students.
- `/dashboard` - Student-specific feed, stats, and quick actions.
- `/recruiter` - Recruiter-specific dashboard for talent discovery and shortlists.
- `/admin` - Platform management (moderation, hackathon creation).
- `/messages` - Direct messaging interface with real-time optimistic UI updates.
- `/profile/[id]` - Public view of a student or recruiter profile.
- `/project/[id]` / `/idea/[id]` - Detailed view pages for submissions.
- `/teams` - Team discovery and management.
- `/hackathon` - Hackathon listing and participation portal.
- `/how-it-works` - The user manual / guide.

## 6. Styling & UI Philosophy
- **CSS Architecture:** Uses `globals.css` for CSS variables (colors, spacing, radiuses, typography) and global resets. Component-specific styles use `[name].module.css`.
- **Design Language:** "Hyper-modern". Heavy use of dark mode, glowing accents, blur effects (`backdrop-filter`), subtle borders (`rgba(255,255,255,0.1)`), and gradients. 
- **Responsiveness:** Fluid layouts using flexbox/grid.

## 7. Key Technical Patterns
- **Server Actions:** Data mutations (creating projects, sending messages) are handled via Next.js Server Actions (e.g., `app/actions/messages.ts`).
- **Context Providers:** Global state (Auth, Notifications) is managed via React Context (`context/AuthContext.tsx`, `context/NotificationContext.tsx`).
- **Optimistic Updates:** UI often updates immediately before the server responds to ensure a snappy user experience (especially visible in the messaging and liking systems).

