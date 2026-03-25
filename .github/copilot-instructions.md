# GitHub Copilot Instructions for AI Customer Support Project

## Code Style Guidelines

### Export/Import Conventions

**❌ DO NOT use default exports:**

```typescript
// ❌ WRONG
export default function MyComponent() { ... }
export default class MyClass { ... }
export default const myFunction = () => { ... }
```

**✅ ALWAYS use named exports:**

```typescript
// ✅ CORRECT
export function MyComponent() { ... }
export class MyClass { ... }
export const myFunction = () => { ... }
```

**✅ Import using destructuring:**

```typescript
// ✅ CORRECT
import { MyComponent } from "@/components/MyComponent";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
```

### Reasoning

- **Explicit naming**: Named exports make refactoring easier (IDE auto-rename works)
- **Better tree-shaking**: Bundlers can optimize named exports more effectively
- **Consistency**: Single import style across the entire codebase
- **Type safety**: TypeScript provides better autocomplete with named exports
- **Code search**: Easier to find all usages of a component/function

### Component Structure

```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", ...props }: ButtonProps) {
  return <button className={cn(/* ... */)} {...props} />;
}
```

### UI Library

**Use shadcn/ui approach:**

- Components in `components/ui/`
- Tailwind CSS utility classes
- Accessibility features (ARIA, keyboard navigation)
- `cn()` utility for conditional class names
- Fully customizable and production-ready

### Next.js Pages

**Even for pages and layouts, use named exports:**

```typescript
// app/page.tsx
export function HomePage() {
  return <div>Home</div>;
}

// app/layout.tsx
export function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body>{children}</body></html>;
}
```

Then export as default for Next.js convention:

```typescript
// app/page.tsx
export function HomePage() { ... }
export default HomePage; // Next.js requires default export for pages
```

**But prefer importing the named export internally:**

```typescript
// Other components importing
import { HomePage } from "@/app/page";
```

## TypeScript Guidelines

- Always use explicit types for function parameters
- Prefer `interface` over `type` for object shapes
- Use `React.FC` sparingly (prefer explicit props typing)
- Enable strict mode in tsconfig.json

## Naming Conventions

- **Components**: PascalCase (e.g., `TicketForm`, `UserProfile`)
- **Functions**: camelCase (e.g., `createTicket`, `validateEmail`)
- **Files**: Match component name (e.g., `TicketForm.tsx`, not `ticket-form.tsx`)
- **Folders**: kebab-case for route segments (e.g., `app/manager/pending/`)

## Import Order

```typescript
// 1. External dependencies
import { useState } from "react";

// 2. Internal absolute imports (@/)
import { Button } from "@/components/ui/Button";
import { createTicket } from "@/lib/api/tickets";

// 3. Relative imports
import { TicketCard } from "./TicketCard";

// 4. Types (if not inlined)
import type { Ticket } from "@/types/ticket";
```

---

**Remember: Consistency is key. Follow these guidelines for all new code and refactor existing code when making changes.**
