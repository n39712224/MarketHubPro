# MarketHub - Design System Documentation

## Design Philosophy

MarketHub follows a modern, clean design aesthetic that prioritizes user experience, accessibility, and professional appearance for marketplace transactions.

## Visual Identity

### Brand Colors
```css
/* Primary Colors */
--primary: 262.1 83.3% 57.8%        /* Purple-blue gradient base */
--primary-foreground: 210 20% 98%   /* Light text on primary */

/* Secondary Colors */
--secondary: 220 14.3% 95.9%        /* Light gray background */
--secondary-foreground: 220.9 39.3% 11%  /* Dark text on secondary */

/* Accent Colors */
--accent: 220 14.3% 95.9%           /* Interactive elements */
--accent-foreground: 220.9 39.3% 11%    /* Text on accent */

/* State Colors */
--destructive: 0 84.2% 60.2%        /* Error/danger states */
--destructive-foreground: 210 20% 98%   /* Text on destructive */

/* Neutral Colors */
--background: 0 0% 100%             /* Main background */
--foreground: 220.9 39.3% 11%      /* Primary text */
--muted: 220 14.3% 95.9%           /* Muted backgrounds */
--muted-foreground: 220 8.9% 46.1% /* Muted text */

/* Border Colors */
--border: 220 13% 91%               /* Default borders */
--input: 220 13% 91%                /* Input field borders */
--ring: 262.1 83.3% 57.8%          /* Focus rings */
```

### Typography Scale
```css
/* Font Families */
--font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", 
             Roboto, "Helvetica Neue", Arial, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px */
--text-lg: 1.125rem   /* 18px */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px */
--text-3xl: 1.875rem  /* 30px */
--text-4xl: 2.25rem   /* 36px */

/* Font Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Spacing System
```css
/* Spacing Scale (Tailwind-based) */
--space-1: 0.25rem    /* 4px */
--space-2: 0.5rem     /* 8px */
--space-3: 0.75rem    /* 12px */
--space-4: 1rem       /* 16px */
--space-5: 1.25rem    /* 20px */
--space-6: 1.5rem     /* 24px */
--space-8: 2rem       /* 32px */
--space-10: 2.5rem    /* 40px */
--space-12: 3rem      /* 48px */
--space-16: 4rem      /* 64px */
```

## Component Design Patterns

### Cards and Containers
```css
/* Glass Effect Pattern */
.glass-effect {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Card Elevation */
.card-elevated {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card-elevated-hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

### Button System
```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

/* Secondary Button */
.btn-secondary {
  background: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
}

/* Destructive Button */
.btn-destructive {
  background: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
}
```

### Form Elements
```css
/* Input Fields */
.input-field {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

/* Select Dropdowns */
.select-trigger {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Upload Areas */
.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.05);
}
```

## Layout Patterns

### Grid Systems
```css
/* Responsive Grid for Listings */
.listings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

/* Sidebar Layout */
.sidebar-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  height: 100vh;
}

@media (max-width: 768px) {
  .sidebar-layout {
    grid-template-columns: 1fr;
    height: auto;
  }
}
```

### Navigation Design
```css
/* Header Navigation */
.header-nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Mobile Navigation */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 1rem;
  display: flex;
  justify-content: space-around;
}
```

## Background and Effects

### Gradient Backgrounds
```css
/* Primary Gradient Background */
.bg-gradient-primary {
  background: linear-gradient(135deg, 
    #f8fafc 0%, 
    #eff6ff 25%, 
    #faf5ff 50%, 
    #f8fafc 100%);
}

/* Dark Mode Gradient */
.dark .bg-gradient-primary {
  background: linear-gradient(135deg, 
    #0f172a 0%, 
    #1e3a8a 25%, 
    #581c87 50%, 
    #0f172a 100%);
}

/* Radial Pattern Overlay */
.pattern-overlay {
  background-image: radial-gradient(circle at 50% 50%, 
    rgba(120, 119, 198, 0.1) 0%, 
    transparent 50%);
}

/* Grid Pattern */
.grid-pattern {
  background-image: 
    linear-gradient(to right, #f1f5f9 1px, transparent 1px),
    linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.5;
}
```

### Animation System
```css
/* Hover Animations */
.hover-lift {
  transition: transform 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

/* Loading Animations */
.loading-spinner {
  animation: spin 1s linear infinite;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #8b5cf6;
  border-radius: 50%;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Fade In Animation */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## Component Guidelines

### Listing Cards
```tsx
// Design Specifications
interface ListingCardDesign {
  dimensions: "280px min-width, flexible height";
  imageAspectRatio: "4:3";
  padding: "1rem";
  borderRadius: "0.75rem";
  shadow: "subtle elevation with hover enhancement";
  
  content: {
    title: "font-semibold, 1.125rem, 2-line truncation";
    price: "font-bold, 1.25rem, primary color";
    description: "font-normal, 0.875rem, 3-line truncation";
    metadata: "font-medium, 0.75rem, muted color";
  };
}
```

### Modal and Dialog Design
```css
/* Modal Overlay */
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  position: fixed;
  inset: 0;
  z-index: 50;
}

/* Modal Content */
.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  margin: auto;
  top: 50%;
  transform: translateY(-50%);
}
```

### Form Design Standards
```css
/* Form Container */
.form-container {
  max-width: 500px;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Field Groups */
.field-group {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

/* Error States */
.field-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

## Dark Mode Support

### Color Overrides
```css
.dark {
  --background: 220.9 39.3% 11%;
  --foreground: 210 20% 98%;
  --muted: 215 27.9% 16.9%;
  --muted-foreground: 217.9 10.6% 64.9%;
  --border: 215 27.9% 16.9%;
  --input: 215 27.9% 16.9%;
}

/* Dark Mode Components */
.dark .glass-effect {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.dark .card-elevated {
  background: #1e293b;
  border: 1px solid #334155;
}
```

## Responsive Design Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 640px) {  /* sm */
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {  /* md */
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) { /* lg */
  .responsive-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1280px) { /* xl */
  .responsive-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

## Accessibility Standards

### Focus Management
```css
/* Focus Visible */
.focus-visible:focus {
  outline: 2px solid #8b5cf6;
  outline-offset: 2px;
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #8b5cf6;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 100;
}

.skip-link:focus {
  top: 6px;
}
```

### ARIA Labels and Semantic HTML
```tsx
// Component Accessibility Examples
<button 
  aria-label="Add new listing"
  aria-describedby="add-listing-help"
>
  <PlusIcon />
</button>

<div 
  role="grid" 
  aria-label="Product listings"
>
  {listings.map(listing => (
    <div role="gridcell" key={listing.id}>
      {/* Listing content */}
    </div>
  ))}
</div>
```

## Performance Guidelines

### Image Optimization
```css
/* Responsive Images */
.responsive-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 0.5rem;
}

/* Lazy Loading */
.lazy-image {
  opacity: 0;
  transition: opacity 0.3s;
}

.lazy-image.loaded {
  opacity: 1;
}
```

### CSS Optimization
```css
/* Use transform for animations (GPU acceleration) */
.animated-element {
  will-change: transform;
  transform: translateZ(0);
}

/* Avoid expensive properties in animations */
/* ❌ Don't animate: box-shadow, border-radius, etc. */
/* ✅ Do animate: transform, opacity */
```

---

*Design System Version: 1.0*
*Last Updated: July 12, 2025*
*Framework: Tailwind CSS + shadcn/ui*