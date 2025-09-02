import React from 'react';
import { DonutChart as DonutChartPrimitive } from '@tremor/react';
import { Cell, Label, Pie } from 'recharts';
import { cn } from '@/lib/utils';

const DonutChart = React.forwardRef(
  (
    {
      data = [],
      category,
      index,
      colors = [],
      valueFormatter = (value) => value.toString(),
      showLabel = true,
      showAnimation = true,
      className,
      ...props
    },
    forwardedRef
  ) => {
    const categoryVal = category;
    const chartRef = React.useRef(null);
    const [activeIndex, setActiveIndex] = React.useState(null);

    const onDonutEnter = (_, index) => {
      setActiveIndex(index);
    };

    const onDonutLeave = () => {
      setActiveIndex(null);
    };

    const valueSum = React.useMemo(
      () => data.reduce((acc, curr) => acc + curr[categoryVal], 0),
      [data, categoryVal]
    );

    return (
      <div
        ref={forwardedRef}
        className={cn('h-full w-full', className)}
        {...props}
      >
        <DonutChartPrimitive
          ref={chartRef}
          data={data}
          category={categoryVal}
          index={index}
          colors={colors}
          valueFormatter={valueFormatter}
          showLabel={showLabel}
          showAnimation={showAnimation}
          className="h-40"
          onMouseEnter={onDonutEnter}
          onMouseLeave={onDonutLeave}
          customTooltip={({ payload, active }) => {
            if (!active || !payload || !payload.length) return null;
            const categoryPayload = payload[0];
            if (!categoryPayload) return null;
            return (
              <div className="min-w-[12rem] rounded-lg border bg-background p-2 text-sm shadow-sm">
                <div className="flex items-center gap-2 border-b border-border p-2">
                  <div
                    className={cn('h-3 w-3 shrink-0 rounded-full', categoryPayload.color)}
                  />
                  <p className="font-medium text-foreground">
                    {categoryPayload.name}
                  </p>
                </div>
                <div className="space-y-1 p-2">
                  <div className="flex items-center justify-between">
                    <span>Valor</span>
                    <span>{valueFormatter(categoryPayload.value)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Participação</span>
                    <span>{((categoryPayload.value / valueSum) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          }}
        >
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            dataKey={categoryVal}
            nameKey={index}
            innerRadius="50%"
            outerRadius="80%"
            strokeWidth={2}
            isAnimationActive={showAnimation}
          >
            <Label
              position="center"
              content={({ viewBox }) => {
                if (activeIndex !== null && viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  const { cx, cy } = viewBox;
                  const name = data[activeIndex][index];
                  const value = data[activeIndex][categoryVal];
                  return (
                    <foreignObject
                      x={cx - 60}
                      y={cy - 30}
                      width="120"
                      height="60"
                      className="overflow-visible"
                    >
                      <div className="flex h-full w-full flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium text-muted-foreground">{name}</p>
                        <p className="text-xl font-medium text-foreground">{valueFormatter(value)}</p>
                      </div>
                    </foreignObject>
                  );
                }
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  const { cx, cy } = viewBox;
                  return (
                    <foreignObject
                      x={cx - 60}
                      y={cy - 30}
                      width="120"
                      height="60"
                      className="overflow-visible"
                    >
                      <div className="flex h-full w-full flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium text-muted-foreground">Total</p>
                        <p className="text-xl font-medium text-foreground">{valueFormatter(valueSum)}</p>
                      </div>
                    </foreignObject>
                  );
                }
                return null;
              }}
            />
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color || `hsl(var(--primary))`} />
            ))}
          </Pie>
        </DonutChartPrimitive>
      </div>
    );
  }
);

DonutChart.displayName = 'DonutChart';

export { DonutChart };