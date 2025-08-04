# LionRocket Theme Guide

## Color Palette

### Primary Colors
- **Primary Accent**: `#B8EEA2` - Soft green for accents, borders, and decorative elements
- **Primary Button**: `#5A8F47` - Darker green for buttons with white text (WCAG AA compliant)
- **Primary Hover**: `#4A7C3C` - Even darker green for hover states
- **Primary Light**: `#E7F7E1` - Very light green for subtle backgrounds
- **Primary Focus**: `#3D6630` - Darkest green for focus states

### Background Colors
- **Main Background**: `#FAFAFA` - Very light gray for main page backgrounds
- **Card Background**: `#FFFFFF` - Pure white for cards and modals
- **Secondary Background**: `#F9FAFB` - Slightly darker than white for input fields
- **Tertiary Background**: `#F3F4F6` - Light gray for hover states and secondary elements

### Text Colors
- **Primary Text**: `#1F2937` - Almost black for main text
- **Secondary Text**: `#6B7280` - Medium gray for secondary text
- **Tertiary Text**: `#9CA3AF` - Light gray for less important text
- **Label Text**: `#374151` - Dark gray for form labels

### Border Colors
- **Default Border**: `#E5E7EB` - Light gray for borders
- **Focus Border**: `#B8EEA2` - Primary green for focused inputs

### Status Colors
- **Error Background**: `#FEE2E2` - Light red background
- **Error Text**: `#DC2626` - Red text for errors
- **Error Border**: `#FECACA` - Light red border
- **Error Hover**: `#FCA5A5` - Medium red for hover states

## Component Styles

### Buttons
```css
/* Primary Button - High Contrast */
.btn-primary {
  background: #5A8F47;
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(90, 143, 71, 0.25);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #4A7C3C;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(90, 143, 71, 0.35);
}

.btn-primary:focus {
  background: #3D6630;
  box-shadow: 0 0 0 3px rgba(184, 238, 162, 0.4);
}

/* Secondary Button */
.btn-secondary {
  background: #F3F4F6;
  color: #4B5563;
  border: 1px solid #E5E7EB;
}

/* Danger Button */
.btn-danger {
  background: #FEE2E2;
  color: #DC2626;
  border: 1px solid #FECACA;
}
```

### Input Fields
```css
input {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

input:focus {
  border-color: #B8EEA2;
  box-shadow: 0 0 0 3px rgba(184, 238, 162, 0.15);
  background: white;
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
```

### Background Gradients
```css
/* Login/Register Background */
background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%);

/* Subtle Pattern */
background-image: 
  radial-gradient(circle at 20% 50%, rgba(184, 238, 162, 0.06) 0%, transparent 50%);
```

## Typography
- **Font Family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif
- **Base Font Size**: 16px (1rem)
- **Heading Font Weight**: 600-700
- **Body Font Weight**: 400-500

## Spacing
- **Border Radius**: 8px for buttons and inputs, 16px for cards and modals
- **Padding**: 0.75rem - 1.5rem for buttons, 1rem - 2rem for cards
- **Box Shadow**: Use rgba(184, 238, 162, 0.25) for primary elements, rgba(0, 0, 0, 0.05) for neutral

## Usage Guidelines

1. **Always use #B8EEA2 for primary actions** - buttons, links, active states
2. **Maintain light backgrounds** - #FAFAFA or #FFFFFF for main areas
3. **Use subtle shadows** - Avoid harsh shadows, prefer soft ones
4. **Keep text readable** - Use #1F2937 for main text on light backgrounds
5. **Consistent hover states** - Add translateY(-1px) and enhanced shadow on hover
6. **Focus accessibility** - Always add focus states with green border and shadow

## Example Implementation

```vue
<template>
  <div class="container">
    <div class="card">
      <h2 class="title">Welcome</h2>
      <p class="description">This is using our theme colors</p>
      <button class="btn-primary">Get Started</button>
    </div>
  </div>
</template>

<style scoped>
.container {
  background: #FAFAFA;
  padding: 2rem;
}

.card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.title {
  color: #1F2937;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.description {
  color: #6B7280;
  margin-bottom: 1.5rem;
}

.btn-primary {
  background: #B8EEA2;
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(184, 238, 162, 0.25);
}

.btn-primary:hover {
  background: #A3D48E;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(184, 238, 162, 0.35);
}
</style>
```

## Future Components

When creating new components, follow these guidelines:
1. Use the color palette defined above
2. Maintain consistent spacing and border radius
3. Add appropriate hover and focus states
4. Ensure text contrast meets accessibility standards
5. Use the primary green (#B8EEA2) for important interactive elements