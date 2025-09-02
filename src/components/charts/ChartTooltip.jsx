import React from 'react';
import { cn } from '@/lib/utils';

const ChartTooltip = ({
  active,
  payload,
  label,
  valueFormatter = (value) => value.toString(),
  payloadSort,
}) => {
  if (active && payload && payload.length) {
    const filteredPayload = payloadSort ? [...payload].sort((a, b) => payloadSort(a, b)) : payload;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex flex-col space-y-1">
            <p className="text-right text-muted-foreground">{label}</p>
            {filteredPayload.map(({ name, value, color, dataKey }, index) => (
              <div key={`id-${index}`} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-[2px] border-[1px] border-transparent"
                    style={{ backgroundColor: color }}
                  />
                  <p className="whitespace-nowrap text-right text-sm text-muted-foreground">
                    {name}
                  </p>
                </div>
                <p className="whitespace-nowrap text-right font-medium tabular-nums text-foreground sm:text-sm">
                  {valueFormatter(value, dataKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

ChartTooltip.displayName = 'ChartTooltip';

export { ChartTooltip };