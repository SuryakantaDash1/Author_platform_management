# Icons Directory

This directory contains all icon-related assets and exports for the POVITAL application.

## Icon Library

We use **Lucide React** as our primary icon library. Lucide provides over 1000 beautiful, consistent icons that are perfect for modern web applications.

### Installation

Lucide React is already included in the project dependencies:

```bash
npm install lucide-react
```

## Usage

### Method 1: Using Centralized Exports (Recommended)

Import icons from the centralized export file for better consistency:

```tsx
import { DashboardIcon, BookIcon, UserIcon } from '@/assets/icons';

function MyComponent() {
  return (
    <div>
      <DashboardIcon className="w-5 h-5 text-primary-600" />
      <BookIcon className="w-6 h-6" />
      <UserIcon size={24} />
    </div>
  );
}
```

### Method 2: Direct Import

You can also import directly from lucide-react:

```tsx
import { Book, User, Settings } from 'lucide-react';

function MyComponent() {
  return <Book className="w-5 h-5" />;
}
```

## Icon Sizing

Follow these standard sizes for consistency:

- **Small**: `w-4 h-4` (16px) - For inline text, small buttons
- **Default**: `w-5 h-5` (20px) - For most UI elements
- **Medium**: `w-6 h-6` (24px) - For larger buttons, cards
- **Large**: `w-8 h-8` (32px) - For headers, hero sections

```tsx
// Small
<Icon className="w-4 h-4" />

// Default
<Icon className="w-5 h-5" />

// Medium
<Icon className="w-6 h-6" />

// Large
<Icon className="w-8 h-8" />

// Using size prop
<Icon size={20} />
```

## Icon Colors

Icons inherit the text color by default. Use Tailwind classes:

```tsx
// Primary color
<Icon className="text-primary-600 dark:text-primary-400" />

// Neutral/gray
<Icon className="text-neutral-600 dark:text-dark-600" />

// Success
<Icon className="text-success-DEFAULT" />

// Error
<Icon className="text-error-DEFAULT" />

// Warning
<Icon className="text-warning-DEFAULT" />
```

## Icon Categories

### Navigation Icons
- DashboardIcon, MenuIcon, CloseIcon
- ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon
- ArrowLeftIcon, ArrowRightIcon, HomeIcon

### User & Account Icons
- UserIcon, UsersIcon, UserPlusIcon, UserCheckIcon
- LoginIcon, LogoutIcon, SettingsIcon, BellIcon

### Book & Content Icons
- BookIcon, BookOpenIcon, LibraryIcon
- DocumentIcon, FileIcon, FilesIcon
- UploadIcon, DownloadIcon

### Financial Icons
- DollarIcon, CreditCardIcon, WalletIcon
- TrendingUpIcon, TrendingDownIcon
- BarChartIcon, PieChartIcon, LineChartIcon

### Action Icons
- PlusIcon, MinusIcon, EditIcon, TrashIcon
- SaveIcon, CopyIcon, CheckIcon, CheckCircleIcon

### Status & Alert Icons
- AlertCircleIcon, AlertTriangleIcon, InfoIcon
- ErrorIcon, HelpIcon

### Communication Icons
- MailIcon, MessageIcon, ChatIcon
- SendIcon, PhoneIcon

## Custom SVG Icons

If you need custom SVG icons not available in Lucide:

1. Add your SVG files to this directory
2. Create a component wrapper:

```tsx
// CustomIcon.tsx
import React from 'react';

interface CustomIconProps {
  className?: string;
  size?: number;
}

const CustomIcon: React.FC<CustomIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Your SVG path here */}
    </svg>
  );
};

export default CustomIcon;
```

3. Export from index.ts:

```tsx
export { default as CustomIcon } from './CustomIcon';
```

## Best Practices

1. **Consistency**: Always use icons from the centralized export
2. **Sizing**: Use standard sizes (w-4, w-5, w-6, w-8)
3. **Colors**: Match icon colors with design system
4. **Accessibility**: Add aria-label or aria-hidden as needed
5. **Performance**: Icons are tree-shakeable, only imported icons are bundled

## Examples

### Button with Icon

```tsx
import { PlusIcon } from '@/assets/icons';
import { Button } from '@/components';

<Button leftIcon={<PlusIcon />}>
  Add New Book
</Button>
```

### Icon Button

```tsx
import { SearchIcon } from '@/assets/icons';

<button className="p-2 rounded-lg hover:bg-neutral-100">
  <SearchIcon className="w-5 h-5 text-neutral-600" />
</button>
```

### Status Badge with Icon

```tsx
import { CheckCircleIcon } from '@/assets/icons';

<div className="flex items-center gap-2">
  <CheckCircleIcon className="w-5 h-5 text-success-DEFAULT" />
  <span>Published</span>
</div>
```

## Resources

- [Lucide React Documentation](https://lucide.dev/guide/packages/lucide-react)
- [Lucide Icon Gallery](https://lucide.dev/icons/)
- [POVITAL Design System](../../../DESIGN_SYSTEM.md)
