# Icon System - Professional & Elegant

## Overview

All emojis have been replaced with professional Lucide React icons for a more elegant, mature UI design.

## Icon Library

**Package:** `lucide-react`  
**Version:** Latest  
**Documentation:** https://lucide.dev/

## Installation

Already installed. If needed in another project:
```bash
npm install lucide-react
```

## Icon Component

A centralized Icon component has been created at:
`/frontend/src/components/Icon.jsx`

### Usage

```jsx
import Icon from './components/Icon';

// Simple usage with name
<Icon name="dashboard" size={20} />

// With custom className
<Icon name="book" size={24} className="custom-class" />

// With additional props
<Icon name="user" size={18} color="#14BF96" />
```

### Available Icon Names

#### Navigation
- `dashboard` - Dashboard icon
- `menu` - Menu/hamburger icon
- `close` - Close/X icon
- `chevron-left`, `chevron-right`, `chevron-up`, `chevron-down` - Arrows

#### Academic
- `book`, `courses`, `course` - Book/course icon
- `library` - Library icon
- `graduation` - Graduation cap
- `award`, `certificate` - Award/certificate
- `calendar` - Calendar icon

#### Documents & Files
- `file`, `document` - File icon
- `material`, `materials` - Study materials
- `folder`, `folder-open` - Folder icons

#### Actions
- `clipboard`, `assignment`, `assignments` - Clipboard
- `edit` - Edit/pencil icon
- `delete` - Trash/delete icon
- `add`, `remove` - Plus/minus icons
- `check` - Checkmark
- `save` - Save icon
- `download`, `upload` - Transfer icons
- `search` - Search icon
- `filter` - Filter icon
- `refresh` - Refresh/reload

#### Users & People
- `user` - Single user
- `users`, `staff` - Multiple users
- `user-circle`, `student`, `students` - User with circle
- `user-plus` - Add user

#### Communication
- `bell`, `notification` - Notification bell
- `mail` - Email icon
- `message` - Message/chat
- `send` - Send icon

#### Quiz & Assessment
- `quiz`, `question` - Question mark icon
- `check-circle` - Success/correct
- `x-circle` - Error/incorrect
- `alert` - Alert/warning

#### Results & Analytics
- `trophy`, `results` - Trophy/results
- `trending-up`, `trending-down` - Trend arrows
- `chart`, `bar-chart`, `pie-chart`, `stats` - Chart icons

#### Media
- `play`, `pause` - Media controls
- `video` - Video icon
- `image` - Image icon

#### System
- `settings` - Settings/gear
- `logout` - Logout/sign out
- `lock`, `unlock` - Security icons
- `eye`, `eye-off` - Visibility toggle
- `info` - Information
- `warning` - Warning triangle

## Direct Component Usage

You can also import icons directly from `lucide-react`:

```jsx
import { BookOpen, Users, Trophy } from 'lucide-react';

<BookOpen size={20} />
<Users size={24} className="custom-class" />
<Trophy size={18} color="#14BF96" />
```

## Updated Components

### Sidebars
All three sidebar components now use Lucide icons:
- **Admin Sidebar:** Dashboard, Calendar, GraduationCap, Library, BookOpen, Users, UserCircle, ClipboardList, Award, LogOut
- **Staff Sidebar:** Dashboard, BookOpen, FileText, ClipboardList, HelpCircle, LogOut
- **Student Sidebar:** Dashboard, BookOpen, ClipboardList, HelpCircle, Trophy, LogOut

### Header
- **Bell icon** for notifications (with badge)

### StatCard
- **TrendingUp/TrendingDown** for trend indicators

## Icon Props

All Lucide icons support these common props:

```jsx
<Icon 
    name="dashboard"
    size={20}              // Number: icon size in pixels
    color="#14BF96"        // String: any valid CSS color
    strokeWidth={2}        // Number: stroke width (default: 2)
    className="nav-icon"   // String: CSS class
    style={{}}             // Object: inline styles
/>
```

## Styling Icons

### CSS Variables
Icons inherit the current text color by default:

```css
.nav-item {
    color: var(--text-secondary);
}

.nav-item:hover {
    color: var(--text-main);
}

.nav-item.active {
    color: var(--primary-color);
}
```

### Icon Sizing
Consistent sizes used throughout the app:
- **20px** - Navigation items, buttons
- **18px** - Smaller UI elements
- **24px** - Larger emphasis
- **16px** - Inline text icons

### Animation
Icons can be animated with CSS:

```css
.nav-icon {
    transition: transform 0.2s ease;
}

.nav-item:hover .nav-icon {
    transform: translateX(2px);
}

.nav-item.active .nav-icon {
    transform: scale(1.1);
}
```

## Migration Guide

### Before (Emojis)
```jsx
<span className="nav-icon">📊</span>
Dashboard

<span className="stat-icon">📚</span>
```

### After (Lucide Icons)
```jsx
<LayoutDashboard className="nav-icon" size={20} />
Dashboard

<BookOpen size={24} />
```

### Before (StatCard)
```jsx
{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
```

### After (StatCard)
```jsx
{trend > 0 ? (
    <TrendingUp size={14} />
) : (
    <TrendingDown size={14} />
)}
{Math.abs(trend)}%
```

## Benefits

### Professional Appearance
- ✅ Consistent icon style across the entire application
- ✅ Clean, modern look
- ✅ Suitable for professional/educational environment
- ✅ No childish emoji appearance

### Performance
- ✅ SVG icons (scalable, crisp at any size)
- ✅ Lightweight (tree-shakeable)
- ✅ Fast rendering
- ✅ No emoji font dependencies

### Accessibility
- ✅ Better screen reader support
- ✅ Proper ARIA labels can be added
- ✅ High contrast support
- ✅ Works in all browsers

### Maintainability
- ✅ Centralized icon system
- ✅ Easy to change icons globally
- ✅ Type-safe with TypeScript (if enabled)
- ✅ Well-documented library

## Color Scheme with Icons

Icons automatically adapt to the color scheme:

```css
/* Primary actions */
color: var(--primary-color);  /* #14BF96 - Teal */

/* Secondary text */
color: var(--text-secondary); /* #6B7280 - Gray */

/* Active states */
color: var(--primary-color);  /* Teal */

/* Danger actions (delete, logout hover) */
color: #DC2626;               /* Red */

/* Success indicators */
color: #059669;               /* Green */
```

## Examples in Context

### Navigation Item
```jsx
<NavLink to="/admin/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
    <BookOpen className="nav-icon" size={20} />
    Courses
</NavLink>
```

### Stat Card
```jsx
<StatCard 
    title="Total Students" 
    value="1,234"
    icon={<Users size={24} />}
    trend={5.2}
/>
```

### Header Action
```jsx
<button className="icon-btn" aria-label="Notifications">
    <Bell size={20} />
    <span className="notification-badge"></span>
</button>
```

### Button with Icon
```jsx
<button className="btn btn-primary">
    <Plus size={18} style={{ marginRight: '8px' }} />
    Add Course
</button>
```

## Further Customization

### Custom Icon Component
Create specific icon components for repeated use:

```jsx
// components/CourseIcon.jsx
import { BookOpen } from 'lucide-react';

const CourseIcon = ({ size = 20, className = '' }) => (
    <BookOpen 
        size={size} 
        className={`course-icon ${className}`}
    />
);

export default CourseIcon;
```

### Icon with Text Helper
```jsx
// components/IconText.jsx
const IconText = ({ icon: Icon, children, iconSize = 18 }) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={iconSize} />
        <span>{children}</span>
    </span>
);

// Usage
<IconText icon={BookOpen}>My Courses</IconText>
```

## Browser Support

Lucide icons work in all modern browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Mobile browsers

## Resources

- **Icon Library:** https://lucide.dev/icons/
- **NPM Package:** https://www.npmjs.com/package/lucide-react
- **GitHub:** https://github.com/lucide-icons/lucide

---

**Version:** 1.0  
**Date:** January 17, 2025  
**Status:** ✅ Implemented  
**Breaking Changes:** None (backward compatible)
