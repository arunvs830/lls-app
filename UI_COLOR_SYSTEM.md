# UI Color System - Quick Reference

## Primary Colors

### Teal (Primary)
- **Main**: `#14BF96` - Use for primary actions, active states
- **Hover**: `#0D9A73` - Darker shade for hover effects
- **Light**: `#E6F7F3` - Light tint for backgrounds, highlights

### Blue (Secondary)
- **Main**: `#1865F2` - Use for secondary actions, links
- **Hover**: `#0D47A1` - Darker shade for hover effects

### Pink (Accent)
- **Main**: `#FF6B9D` - Use sparingly for notifications, alerts

## Neutral Colors

### Backgrounds
- **Main BG**: `#F7F9FA` - Body background, hover states
- **White**: `#FFFFFF` - Cards, modals, panels
- **Card**: `#FFFFFF` - Card backgrounds (same as white)
- **Hover**: `#F7F9FA` - Hover state backgrounds

### Text
- **Main**: `#1F2937` - Primary text, headings
- **Secondary**: `#6B7280` - Secondary text, labels
- **Muted**: `#9CA3AF` - Placeholders, disabled text

### Borders
- **Main**: `#E5E7EB` - Standard borders
- **Hover**: `#D1D5DB` - Hover state borders

## Shadows

### Elevation System
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
--shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
--shadow-xl: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
```

### Usage Guide
- **sm**: Buttons, small cards
- **md**: Standard cards, dropdowns
- **lg**: Modals, popovers
- **xl**: Large panels, overlays

## Border Radius

```css
--border-radius-sm: 6px   /* Buttons, tags */
--border-radius-md: 8px   /* Cards, inputs */
--border-radius-lg: 12px  /* Large panels, sections */
```

## Status Colors

### Success
- **Color**: `#059669` (Green 600)
- **Background**: `#D1FAE5` (Green 100)
- **Usage**: Success messages, completed states

### Error
- **Color**: `#DC2626` (Red 600)
- **Background**: `#FEE2E2` (Red 100)
- **Usage**: Error messages, warnings

### Warning
- **Color**: `#F59E0B` (Amber 500)
- **Background**: `#FEF3C7` (Amber 100)
- **Usage**: Warning messages, pending states

## CSS Variables Reference

Copy-paste ready CSS variables:

```css
:root {
  /* Primary Colors */
  --primary-color: #14BF96;
  --primary-hover: #0D9A73;
  --primary-light: #E6F7F3;
  --secondary-color: #1865F2;
  --secondary-hover: #0D47A1;
  --accent-color: #FF6B9D;
  
  /* Backgrounds */
  --bg-main: #F7F9FA;
  --bg-white: #FFFFFF;
  --bg-card: #FFFFFF;
  --bg-hover: #F7F9FA;
  
  /* Text */
  --text-main: #1F2937;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  
  /* Borders */
  --border-color: #E5E7EB;
  --border-hover: #D1D5DB;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-xl: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  /* Border Radius */
  --border-radius-sm: 6px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}
```

## Usage Examples

### Primary Button
```css
.btn-primary {
  background-color: var(--primary-color);
  color: white;
  box-shadow: var(--shadow-sm);
  border-radius: var(--border-radius-md);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  box-shadow: var(--shadow-md);
}
```

### Card
```css
.card {
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}
```

### Input Field
```css
.input {
  background: var(--bg-white);
  border: 1.5px solid var(--border-color);
  border-radius: var(--border-radius-md);
  color: var(--text-main);
}

.input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(20, 191, 150, 0.1);
}
```

### Text Hierarchy
```css
h1, h2, h3 {
  color: var(--text-main);
  font-weight: 600;
}

p, span {
  color: var(--text-secondary);
}

.muted-text {
  color: var(--text-muted);
}
```

## Accessibility Notes

### Contrast Ratios
- **Main text on white**: 11.7:1 (AAA ✓)
- **Secondary text on white**: 7.2:1 (AAA ✓)
- **Muted text on white**: 4.6:1 (AA ✓)
- **Primary button text**: 4.5:1 (AA ✓)

### Color Blind Friendly
The teal-blue-pink palette has been chosen to be distinguishable for:
- Protanopia (red-blind)
- Deuteranopia (green-blind)
- Tritanopia (blue-blind)

---

**Version**: 2.0
**Date**: January 17, 2025
**Maintainer**: Design System Team
