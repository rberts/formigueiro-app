import * as React from 'react';
import { cn } from '@/components/lib/utils';

export type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical';
};

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', role = 'separator', ...props }, ref) => (
    <div
      ref={ref}
      role={role}
      aria-orientation={orientation}
      className={cn(
        'bg-slate-800',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...props}
    />
  )
);

Separator.displayName = 'Separator';

export { Separator };
