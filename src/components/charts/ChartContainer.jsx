import React from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const ChartContainer = React.forwardRef(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-[250px] w-full items-center justify-center text-xs',
      className
    )}
    {...props}
  >
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
));

ChartContainer.displayName = 'ChartContainer';

export { ChartContainer };