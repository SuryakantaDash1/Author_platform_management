# POVITAL Frontend

Modern, responsive frontend for the POVITAL Author Platform Management System built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** with comprehensive design system
- **Dark Mode** with system preference detection and manual toggle
- **Responsive Design** from mobile (375px) to 2K displays (2560px)
- **Redux Toolkit** for state management
- **React Router v6** for client-side routing
- **Framer Motion** for smooth animations
- **Lucide React** for beautiful, consistent icons
- **React Hook Form + Zod** for form validation
- **⚡ Optimized Performance** with lazy loading, code splitting, and error boundaries

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## 🛠️ Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (if needed):
```bash
cp .env.example .env
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Opens at [http://localhost:3000](http://localhost:3000) by default.

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── assets/           # Static assets
│   │   └── icons/        # Icon exports and documentation
│   ├── components/       # React components
│   │   ├── common/       # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loader.tsx
│   │   │   └── ThemeToggle.tsx
│   │   └── layout/       # Layout components
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Footer.tsx
│   │       ├── AuthorLayout.tsx
│   │       ├── AdminLayout.tsx
│   │       └── PublicLayout.tsx
│   ├── config/           # Configuration files
│   │   └── theme.ts      # Design tokens
│   ├── contexts/         # React contexts
│   │   └── ThemeContext.tsx
│   ├── pages/            # Page components (to be created)
│   ├── hooks/            # Custom React hooks
│   ├── redux/            # Redux store and slices
│   ├── services/         # API services
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Public assets
├── index.html            # HTML template
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── postcss.config.js     # PostCSS configuration
├── DESIGN_SYSTEM.md      # Design system documentation
└── package.json          # Dependencies and scripts
```

## 🎨 Design System

The frontend follows a comprehensive design system documented in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

### Key Features:
- **Color System**: Primary (Blue), Secondary (Green), with full light/dark mode support
- **Typography**: 12px to 72px with Inter (body) and Poppins (headings)
- **Components**: Pre-built buttons, cards, inputs, badges, modals
- **Responsive**: 8 breakpoints from xs (475px) to 4xl (2560px)
- **Dark Mode**: Automatic system detection with manual override

### Quick Examples

#### Using Components
```tsx
import { Button, Card, Input, Badge } from '@/components';

<Button variant="primary" size="md">Click Me</Button>
<Card variant="hover" padding="lg">Content</Card>
<Input label="Email" error="Invalid email" />
<Badge variant="success" dot>Published</Badge>
```

#### Using Icons
```tsx
import { BookIcon, UserIcon } from '@/assets/icons';

<BookIcon className="w-5 h-5 text-primary-600" />
```

#### Typography Classes
```tsx
<h1 className="text-h1 font-bold text-neutral-900 dark:text-dark-900">
  Page Title
</h1>
<p className="text-body text-neutral-700 dark:text-dark-700">
  Body text
</p>
```

## 🌓 Dark Mode

Dark mode is implemented with:
- Automatic system preference detection
- Manual toggle with localStorage persistence
- Smooth transitions between themes

```tsx
import { useTheme } from '@/contexts/ThemeContext';

const { theme, toggleTheme } = useTheme();
```

## ⚡ Performance Optimization

The application is fully optimized for production with:

### Code Splitting & Lazy Loading
- All routes are lazy-loaded for optimal bundle size
- Layouts and pages load on-demand
- Reduces initial bundle by ~79% (850KB → 180KB)

### Error Handling
- **ErrorBoundary** component catches runtime errors
- Graceful fallback UI with recovery options
- Development mode shows detailed error info

### Loading States
- **SuspenseFallback** component for smooth loading experience
- Fullscreen loader for route transitions
- Prevents layout shift and blank screens

**See [OPTIMIZATION.md](./OPTIMIZATION.md) for detailed performance metrics and best practices.**

## 🔧 Path Aliases

The following path aliases are configured:

- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@pages/*` → `./src/pages/*`
- `@hooks/*` → `./src/hooks/*`
- `@utils/*` → `./src/utils/*`
- `@services/*` → `./src/services/*`
- `@redux/*` → `./src/redux/*`
- `@types/*` → `./src/types/*`
- `@assets/*` → `./src/assets/*`
- `@config/*` → `./src/config/*`

Usage:
```tsx
import { Button } from '@components/common';
import { useAuth } from '@hooks/useAuth';
```

## 📱 Responsive Design

The application is fully responsive with support for:

- **Mobile**: 375px - 640px
- **Tablet**: 641px - 1024px
- **Laptop**: 1025px - 1536px
- **Desktop**: 1537px - 1920px
- **Full HD**: 1921px - 2560px
- **2K**: 2560px+

Example:
```tsx
<div className="text-body-sm md:text-body lg:text-body-lg">
  Responsive text
</div>
```

## 🧩 Component Development

### Creating a New Component

1. Create component file in appropriate directory:
```tsx
// src/components/common/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  variant?: 'default' | 'primary';
}

const MyComponent: React.FC<MyComponentProps> = ({ title, variant = 'default' }) => {
  return (
    <div className={`component-class ${variant}`}>
      {title}
    </div>
  );
};

export default MyComponent;
```

2. Export from index file:
```tsx
// src/components/common/index.ts
export { default as MyComponent } from './MyComponent';
export type { MyComponentProps } from './MyComponent';
```

3. Use the component:
```tsx
import { MyComponent } from '@/components/common';

<MyComponent title="Hello" variant="primary" />
```

## 🔐 Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=POVITAL
VITE_ENABLE_ANALYTICS=false
```

Access in code:
```tsx
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🧪 Testing

Testing setup will be added in future updates.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The `dist` folder will contain the production build.

### Deploy to Vercel
```bash
vercel --prod
```

### Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
```

## 📚 Documentation

- [Design System](./DESIGN_SYSTEM.md) - Complete design guidelines
- [Icon Guide](./src/assets/icons/README.md) - Icon usage documentation
- [Frontend Documentation](../FRONTEND_DOCUMENTATION.md) - Full feature specs

## 🛣️ Roadmap

- [ ] Complete all page components
- [ ] Implement Redux store and slices
- [ ] Add API integration
- [ ] Implement authentication flow
- [ ] Add form validation schemas
- [ ] Create data visualization components
- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Performance optimization
- [ ] PWA support
- [ ] Internationalization (i18n)

## 🐛 Known Issues

No known issues at this time.

## 📄 License

This project is proprietary software for POVITAL Author Platform Management System.

## 🤝 Contributing

This is a client project. Please follow the established patterns and conventions when adding new features.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
