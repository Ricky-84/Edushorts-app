# UI/UX Wireframes and Mockups

## Design System Foundation

### Visual Design Principles
- **Educational Focus**: Clean, distraction-free learning environment
- **Mobile-First**: Optimized for vertical phone usage
- **Accessibility**: High contrast, readable typography, intuitive navigation
- **Gamified Elements**: Playful but professional visual rewards
- **Consistent Branding**: Cohesive visual identity throughout

### Color Palette
```css
:root {
  /* Primary Colors */
  --primary-blue: #6366f1;        /* Main brand color */
  --primary-blue-light: #818cf8;   /* Hover states */
  --primary-blue-dark: #4f46e5;    /* Active states */
  
  /* Secondary Colors */
  --accent-green: #10b981;         /* Success, correct answers */
  --accent-orange: #f59e0b;        /* Warnings, streaks */
  --accent-red: #ef4444;           /* Errors, incorrect answers */
  --accent-purple: #8b5cf6;        /* Achievements, levels */
  
  /* Neutral Colors */
  --gray-50: #f9fafb;             /* Background light */
  --gray-100: #f3f4f6;            /* Card backgrounds */
  --gray-300: #d1d5db;            /* Borders */
  --gray-600: #4b5563;            /* Secondary text */
  --gray-900: #111827;            /* Primary text */
  
  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

### Typography Scale
```css
/* Font Family */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Typography Scale */
--font-xs: 12px;    /* Captions, labels */
--font-sm: 14px;    /* Body text, buttons */
--font-base: 16px;  /* Default body */
--font-lg: 18px;    /* Emphasized text */
--font-xl: 20px;    /* Small headings */
--font-2xl: 24px;   /* Section headings */
--font-3xl: 30px;   /* Page titles */
--font-4xl: 36px;   /* Hero text */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System
```css
/* Spacing Scale (4px base unit) */
--space-1: 4px;     /* xs */
--space-2: 8px;     /* sm */
--space-3: 12px;    /* md */
--space-4: 16px;    /* lg */
--space-5: 20px;    /* xl */
--space-6: 24px;    /* 2xl */
--space-8: 32px;    /* 3xl */
--space-10: 40px;   /* 4xl */
--space-12: 48px;   /* 5xl */
--space-16: 64px;   /* 6xl */
```

## Screen Wireframes

### 1. Onboarding Flow

#### Welcome Screen
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │    [App Logo Animation]     │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│        Welcome to EduShorts     │
│                                 │
│     Master college subjects     │
│    through bite-sized videos    │
│                                 │
│  ┌─────────────────────────────┐ │
│  │       Get Started           │ │
│  └─────────────────────────────┘ │
│                                 │
│       Already have an account?  │
│             Sign In             │
└─────────────────────────────────┘

Component Breakdown:
- Animated Lottie logo (3s loop)
- Hero title (font-3xl, semibold)
- Subtitle (font-base, gray-600)
- Primary CTA button (primary-blue)
- Secondary text link (primary-blue)
```

#### Profile Setup Screen
```
┌─────────────────────────────────┐
│ [←] Step 2 of 7      [Progress] │
│                                 │
│      Tell us about yourself     │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ University                  │ │
│  │ [Search universities...]    │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ Major/Field of Study        │ │
│  │ [Select major...]           │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ Year                        │ │
│  │ ○ 1st  ○ 2nd  ○ 3rd  ○ 4th │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │         Continue            │ │
│  └─────────────────────────────┘ │
│                                 │
│            Skip for now         │
└─────────────────────────────────┘

Component Details:
- Progress indicator (visual progress bar)
- Form inputs with floating labels
- Radio button groups for selections
- Disabled continue button until required fields filled
```

### 2. Main App Navigation

#### Bottom Tab Bar
```
┌─────────────────────────────────┐
│                                 │
│         [Main Content]          │
│                                 │
│                                 │
├─────────────────────────────────┤
│  🎬     🔍     📊     👥     👤  │
│ Learn Explore Progress Social Me │
│   •                             │
└─────────────────────────────────┘

Tab Icons & States:
- Active: Primary-blue with label
- Inactive: Gray-400 with label
- Badge notifications on applicable tabs
- Safe area handling for various devices
```

### 3. Learn Tab (Home Feed)

#### Video Feed Interface
```
┌─────────────────────────────────┐
│              [Video Player]      │
│                                 │
│    ┌─────────────────────────┐  │
│    │                         │  │
│    │     Video Content       │  │
│    │    (9:16 aspect)        │  │
│    │                         │  │
│    │                         │  │
│    │                         │  │
│    │  [Play/Pause Overlay]   │  │
│    │                         │  │
│    │                         │  │
│    │                         │  │
│    └─────────────────────────┘  │
│                                 │
│  ███████████░░░ 0:15 / 0:45     │
│                                 │
│  📱 Calculus I • Derivatives     │
│  Understanding the Power Rule    │
│                                 │
│      💡 Take Quiz    🔖 Save     │
└─────────────────────────────────┘

Right Side Actions (Overlay):
┌───┐
│ ❤️ │ Like (animated heart)
│ 💬 │ Comments 
│ 📤 │ Share
│ 🔖 │ Bookmark
│ ⚡ │ Speed (0.75x-2x)
└───┘

Gesture Controls:
- Swipe Up: Next video
- Swipe Down: Previous video  
- Tap: Play/Pause
- Double Tap: Like
- Long Press: Options menu
```

#### Video Player Controls
```
Video Overlay Controls:
┌─────────────────────────────────┐
│ 🔊     [Title]           ⚙️  ✕  │
│                                 │
│                                 │
│            [Video]              │
│              ⏯️                  │
│                                 │
│                                 │
│ ●●●●●●●●●●░░░░░░                │
│ 0:25                      0:45  │
│                                 │
│ 🔖 Save    💡 Quiz    📤 Share  │
└─────────────────────────────────┘

Control States:
- Play/Pause: Large center button (fades after 3s)
- Progress bar: Scrubber with preview
- Bottom actions: Always visible
- Settings: Speed, quality, captions
```

### 4. Quiz Interface

#### Quiz Modal Overlay
```
┌─────────────────────────────────┐
│  Question 2 of 3           ✕    │
│  ⏱️ 0:28                        │
│                                 │
│  What is the derivative of      │
│  f(x) = 3x² ?                   │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ A) 6x                       │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ B) 3x                       │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ C) 6x²                      │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ D) 3                        │ │
│  └─────────────────────────────┘ │
│                                 │
│           💡 Need a hint?        │
└─────────────────────────────────┘

Interaction States:
- Default: White background, gray border
- Selected: Primary-blue background, white text
- Correct: Green background with checkmark
- Incorrect: Red background with X mark
- Timer: Orange when <10 seconds remaining
```

#### Quiz Results Screen
```
┌─────────────────────────────────┐
│                                 │
│            🎉                   │
│                                 │
│      ┌─────────────────┐        │
│      │       85%       │        │
│      │   Great Job!    │        │
│      └─────────────────┘        │
│                                 │
│  ✅ Correct Answers    2/3      │
│  ⏱️  Time Taken       1:24      │
│  ⭐ Points Earned     85/100    │
│  🔥 Streak Bonus      +10 XP    │
│                                 │
│  ┌─────────────────────────────┐ │
│  │      Continue Learning      │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │         Try Again           │ │
│  └─────────────────────────────┘ │
│                                 │
│          View Explanations      │
└─────────────────────────────────┘

Visual Elements:
- Animated score circle with fill animation
- Celebration confetti animation for high scores
- Color-coded metrics (green=good, orange=ok, red=needs work)
```

### 5. Progress Tab

#### Progress Dashboard
```
┌─────────────────────────────────┐
│  [Profile Avatar]  Level 12     │
│  John Smith       Knowledge     │
│                   Seeker        │
│                                 │
│  ████████████░░░░ 2,450/3,000 XP│
│                                 │
│  ┌─────────────────────────────┐ │
│  │  🔥 Daily Streak            │ │
│  │     7 Days                  │ │
│  │  🎯 Videos Watched          │ │
│  │     142 videos              │ │
│  │  📊 Quiz Average            │ │
│  │     84% correct             │ │
│  └─────────────────────────────┘ │
│                                 │
│  Overview | Subjects | Badges   │
│     •                           │
│                                 │
│  Recent Achievements            │
│  🏆 Week Warrior                │
│  ⚡ Quick Learner               │
│  📚 Math Master                 │
│                                 │
│         View All Badges         │
└─────────────────────────────────┘

Components:
- User avatar with level indicator
- Animated XP progress bar
- Stats cards with icons and metrics
- Tab navigation for different views
- Achievement carousel with animations
```

#### Subject Progress View
```
┌─────────────────────────────────┐
│           Your Progress         │
│                                 │
│  Mathematics                    │
│  ████████████░░░ 75%           │
│  18/24 topics completed         │
│                                 │
│  Computer Science               │
│  ██████░░░░░░░░░ 45%           │
│  12/27 topics completed         │
│                                 │
│  Physics                        │
│  ████░░░░░░░░░░░ 30%           │
│  5/17 topics completed          │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 📈 Mathematics              │ │
│  │    ┌─ Calculus I      90%   │ │
│  │    ├─ Linear Algebra  80%   │ │
│  │    └─ Statistics      55%   │ │
│  └─────────────────────────────┘ │
│                                 │
│           Need Help?            │
│       📚 Study Resources        │
└─────────────────────────────────┘

Visual Design:
- Color-coded progress bars by completion percentage
- Expandable subject sections showing topic breakdown
- Visual hierarchy with clear typography
- Help resources easily accessible
```

### 6. Social Tab

#### Friends & Leaderboard
```
┌─────────────────────────────────┐
│  Friends  |  League  | Groups   │
│     •                           │
│                                 │
│  Weekly Leaderboard - Gold      │
│                                 │
│  1. 👑 Sarah Chen      2,450 XP │
│     🔥 12 day streak            │
│                                 │
│  2. 🥈 Mike Rodriguez  2,200 XP │
│     📚 Math specialist          │
│                                 │
│  3. 🥉 You (John)      1,980 XP │
│     ⚡ Quick learner            │
│                                 │
│  4.    Emma Wilson     1,750 XP │
│                                 │
│  5.    Alex Thompson   1,690 XP │
│                                 │
│  ┌─────────────────────────────┐ │
│  │    🎯 Challenge Friends     │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │    👥 Find Study Partners   │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘

Features:
- Real-time leaderboard with rankings
- Friend status indicators (online, streak info)
- League promotion/relegation indicators
- Quick action buttons for social features
```

### 7. Profile Tab

#### User Profile & Settings
```
┌─────────────────────────────────┐
│              Settings           │
│                                 │
│    [Large Avatar]               │
│       John Smith                │
│    Level 12 • Gold League      │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 👤 Edit Profile             │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 🎓 Academic Info            │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 🔔 Notifications            │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 🎨 Appearance               │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 📊 Data & Privacy           │ │
│  └─────────────────────────────┘ │
│                                 │
│         Help & Support          │
│           Sign Out              │
└─────────────────────────────────┘

Layout:
- Centered profile information
- Clean list-style settings options
- Clear visual hierarchy with consistent spacing
- Important actions (help, sign out) separated
```

## Component Library

### Reusable UI Components

#### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--primary-blue);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  font-weight: var(--font-semibold);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-blue-light);
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--primary-blue);
  border: 2px solid var(--primary-blue);
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
}

/* Icon Button */
.btn-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}
```

#### Cards
```css
.card {
  background: white;
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--gray-100);
}

.card-elevated {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.card-interactive {
  transition: all 0.2s ease;
  cursor: pointer;
}

.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}
```

#### Progress Bars
```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-blue), var(--primary-blue-light));
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-animated {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### Animation Library

#### Loading States
```css
/* Skeleton Loading */
.skeleton {
  background: linear-gradient(90deg, 
    var(--gray-200) 25%, 
    var(--gray-100) 50%, 
    var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

#### Success Animations
```css
/* Achievement Popup */
@keyframes achievement-bounce {
  0% { transform: scale(0) rotate(0deg); }
  50% { transform: scale(1.1) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

.achievement-popup {
  animation: achievement-bounce 0.6s ease-out;
}

/* Confetti Effect */
@keyframes confetti-fall {
  0% { 
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% { 
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
```

## Responsive Design

### Mobile-First Breakpoints
```css
/* Mobile First (default) */
@media (min-width: 375px) {
  /* Small mobile adjustments */
}

@media (min-width: 768px) {
  /* Tablet portrait */
  .container {
    max-width: 640px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  /* Tablet landscape / small desktop */
  .main-content {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: var(--space-8);
  }
}

@media (min-width: 1280px) {
  /* Desktop */
  .container {
    max-width: 1200px;
  }
}
```

### Dark Mode Support
```css
@media (prefers-color-scheme: dark) {
  :root {
    --gray-50: #1a1a1a;
    --gray-100: #262626;
    --gray-300: #404040;
    --gray-600: #a3a3a3;
    --gray-900: #f5f5f5;
  }
  
  .card {
    background: var(--gray-100);
    border-color: var(--gray-300);
  }
}

/* Manual dark mode toggle */
[data-theme="dark"] {
  /* Dark mode variables */
}
```

## Accessibility Guidelines

### WCAG 2.1 AA Compliance
```css
/* Focus indicators */
.focusable:focus {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .card {
    border: 2px solid var(--gray-900);
  }
  
  .btn-primary {
    border: 2px solid transparent;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Touch Target Guidelines
```css
/* Minimum 44px touch targets */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Adequate spacing between interactive elements */
.interactive-group > * + * {
  margin-top: var(--space-2);
}
```

This comprehensive UI/UX design system provides a solid foundation for building an engaging, accessible, and visually appealing educational app that follows modern design principles and best practices.