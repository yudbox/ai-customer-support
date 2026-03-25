# UI Components Library

Accessible, production-ready UI components built with **Tailwind CSS** following the **shadcn/ui** approach.

## Components

### Button

```tsx
import { Button } from "@/components/ui/button";

<Button variant="primary" size="md" disabled={false}>
  Click me
</Button>;
```

**Variants:**

- `primary` - Blue background (default)
- `secondary` - White with border
- `ghost` - Transparent background
- `destructive` - Red background for dangerous actions

**Sizes:**

- `sm` - Small (px-3 py-1.5)
- `md` - Medium (px-6 py-3) - default
- `lg` - Large (px-8 py-4)

---

### Input

```tsx
import { Input } from "@/components/ui/input";

<Input
  type="email"
  label="Email Address"
  placeholder="your@email.com"
  error="Invalid email"
  required
/>;
```

**Features:**

- Automatic label association
- Error state with ARIA support
- Required field indicator
- Focus ring styling
- Disabled state

---

### Textarea

```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea
  label="Description"
  placeholder="Enter description..."
  rows={6}
  maxLength={5000}
  showCharCount
  currentLength={someState.length}
  error="Too short"
  required
/>;
```

**Features:**

- Character counter (optional)
- Label with required indicator
- Error messages with ARIA
- Resizable (vertical only)
- Max length enforcement

---

## Utilities

### cn()

Class name utility combining `clsx` and `tailwind-merge`:

```tsx
import { cn } from "@/lib/utils/cn";

className={cn(
  "base-class",
  condition && "conditional-class",
  "hover:bg-blue-500"
)}
```

---

## Usage Guidelines

### Import from barrel file:

```tsx
// ✅ Preferred
import { Button, Input, Textarea } from "@/components/ui";

// ✅ Also valid
import { Button } from "@/components/ui/button";
```

### Customization:

All components accept `className` prop for Tailwind overrides:

```tsx
<Button className="rounded-full shadow-lg">Custom Button</Button>
```

### Accessibility:

- All components have proper ARIA attributes
- Keyboard navigation supported
- Focus indicators included
- Error messages linked via `aria-describedby`
- Required fields indicated visually and semantically

---

## Tech Stack

- **Tailwind CSS** - Utility-first styling
- **clsx** - Conditional class names
- **tailwind-merge** - Deduplication of Tailwind classes
- **React** - forwardRef for form library compatibility

---

## Adding New Components

1. Create component file in `components/ui/`
2. Use named export: `export function ComponentName() {}`
3. Extend HTML attributes for the element
4. Use `cn()` for conditional classes
5. Add to `components/ui/index.ts`
6. Update this README

---

## Design Philosophy

**Copy-paste, not NPM dependency:**

- Components are in your codebase, fully controlled
- No black-box abstractions
- Easy to customize without fighting the library
- Follows shadcn/ui philosophy

**Tailwind-first:**

- All styling through Tailwind utility classes
- No CSS modules or styled-components
- Responsive out of the box
- Easy to theme

**Production-ready:**

- TypeScript support
- Full accessibility
- Error handling
- Loading states
- Disabled states
