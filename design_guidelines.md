# Hostel Management System - Design Guidelines

## Design Approach
**System-Based Approach**: Following modern admin dashboard patterns inspired by Linear, Vercel Dashboard, and Stripe's admin interfaces. Focus on data density, clarity, and efficient workflows for both admin and student users.

## Core Design Elements

### A. Typography
- **Primary Font**: Inter (Google Fonts) for UI and body text
- **Monospace Font**: JetBrains Mono for data tables, IDs, and numeric values
- **Hierarchy**:
  - Page Headers: text-2xl font-semibold (32px)
  - Section Titles: text-lg font-medium (18px)
  - Card Titles: text-sm font-medium (14px)
  - Body Text: text-sm (14px)
  - Labels/Captions: text-xs text-gray-600 (12px)

### B. Layout System
**Spacing Units**: Use Tailwind units of 2, 4, 6, and 8 consistently
- Component padding: p-4, p-6
- Section gaps: gap-4, gap-6
- Margin between sections: mb-6, mb-8
- Card spacing: p-6 for content cards

**Grid System**:
- Dashboard Stats: 4-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Management Tables: Full-width with max-w-7xl container
- Forms: 2-column layout for efficiency (grid-cols-1 md:grid-cols-2)

### C. Component Library

**Sidebar Navigation**:
- Fixed left sidebar (w-64) with collapsible mobile drawer
- Grouped menu items with subtle dividers
- Active state: subtle background with left border accent
- Icons: Lucide React (16px size)

**Dashboard Cards**:
- Clean white backgrounds with subtle shadow (shadow-sm)
- Rounded corners: rounded-lg
- Border: border border-gray-200
- Stats cards show large numbers (text-3xl font-bold) with labels below

**Data Tables**:
- Striped rows for readability (even:bg-gray-50)
- Sticky headers on scroll
- Action columns (right-aligned) with icon buttons
- Search bar above tables with filters
- Pagination at bottom (showing "1-10 of 45")

**Forms**:
- Clear label-above-input structure
- Input styling: border border-gray-300 rounded-md px-3 py-2
- Focus states: focus:ring-2 focus:ring-blue-500 focus:border-blue-500
- Required fields marked with red asterisk
- Photo upload: Dropzone component with preview
- Submit buttons: Primary CTA at form bottom-right

**Modal/Dialogs**:
- Overlay: bg-black/50 backdrop
- Content: max-w-2xl centered, white bg, rounded-lg
- Header with title and close button (X icon top-right)

**Calendar Interface** (Attendance):
- Month view grid (7 columns for days)
- Click to toggle Present/Absent
- Color-coded states (green for present, red for absent, gray for future)

**Status Badges**:
- Pill-shaped (rounded-full px-2 py-1 text-xs)
- PENDING: bg-yellow-100 text-yellow-800
- APPROVED: bg-green-100 text-green-800
- REJECTED: bg-red-100 text-red-800

### D. Key Screens Layout

**Admin Dashboard Home**:
- Top: 4 stat cards in grid
- Middle row: Notice Board (left 2/3) + Calendar widget (right 1/3)
- Bottom: Recent activities table

**Student Management**:
- Top: Search bar with "Add Student" button (right-aligned)
- Main: Sortable table with student photos (40px rounded avatars), name, room, block, status
- Actions: Edit/View/Delete icons per row

**Financial Approval List**:
- Tabs for PENDING/APPROVED/ALL
- Table with student info, amount, date, payment method
- Approve/Reject buttons in action column

**Student Dashboard**:
- Hero-style profile card showing room allocation with icon graphics
- 3-column grid: Payment Status, Recent Notices, Quick Actions
- Complaint form in modal overlay

### E. Responsive Behavior
- **Desktop (lg+)**: Full sidebar visible, 4-column grids
- **Tablet (md)**: Sidebar collapses to icon-only, 2-column grids
- **Mobile**: Hidden sidebar with hamburger menu, single-column layouts, horizontal scroll for tables

### F. Animations
Use sparingly for polish only:
- Sidebar toggle: transition-all duration-200
- Dropdown menus: subtle fade-in
- No page transitions or scroll animations

## Professional Touches
- Consistent 6px spacing between form fields
- All clickable elements have hover:bg-gray-50 states
- Icons always align with text baseline
- Empty states: Center-aligned illustration + message + CTA button
- Loading states: Skeleton loaders matching content structure