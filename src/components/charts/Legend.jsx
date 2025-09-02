import React from 'react';
import { cn } from '@/lib/utils';

const Legend = React.forwardRef(({ categories, colors, className, ...props }, ref) => {
  return (
    <ol
      ref={ref}
      className={cn('flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm', className)}
      {...props}
    >
      {categories.map((category, i) => (
        <li
          key={category}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <span
            className={cn('h-3 w-3 shrink-0 rounded-full', colors[i])}
            aria-hidden
          />
          <span className="font-medium text-foreground">{category}</span>
        </li>
      ))}
    </ol>
  );
});

Legend.displayName = 'Legend';

export { Legend };