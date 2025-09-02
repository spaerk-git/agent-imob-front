import React from 'react';
import { BarChart as BarChartPrimitive } from '@tremor/react';
import { Bar, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import { ChartTooltip } from '@/components/charts/ChartTooltip';

const BarChart = React.forwardRef(
  (
    {
      data = [],
      categories = [],
      index,
      colors = [],
      valueFormatter = (value) =>
        Intl.NumberFormat('en-US', {
          notation: 'compact',
          compactDisplay: 'short',
        }).format(value),
      layout = 'horizontal',
      stack = false,
      showXAxis = true,
      showYAxis = true,
      yAxisWidth = 56,
      showAnimation = true,
      showGridLines = true,
      showLegend = true,
      showTooltip = true,
      className,
      ...props
    },
    forwardedRef
  ) => {
    const chartRef = React.useRef(null);
    const yAxisDomain = [0, 'auto'];

    return (
      <div
        ref={forwardedRef}
        className={cn('h-80 w-full', className)}
        {...props}
      >
        <BarChartPrimitive
          ref={chartRef}
          data={data}
          index={index}
          categories={categories}
          colors={colors}
          valueFormatter={valueFormatter}
          layout={layout}
          stack={stack}
          showXAxis={showXAxis}
          showYAxis={showYAxis}
          yAxisWidth={yAxisWidth}
          showAnimation={showAnimation}
          showGridLines={showGridLines}
          showLegend={false}
          showTooltip={showTooltip}
          className="h-full"
          customTooltip={(props) => <ChartTooltip {...props} valueFormatter={valueFormatter} />}
        >
          {layout === 'vertical' ? (
            <XAxis
              hide
              type="number"
              domain={yAxisDomain}
              className="text-xs"
            />
          ) : showGridLines ? (
            <YAxis
              width={yAxisWidth}
              hide={!showYAxis}
              axisLine={false}
              tickLine={false}
              type="number"
              domain={yAxisDomain}
              tick={({ x, y, payload }) => (
                <g transform={`translate(${x}, ${y})`}>
                  <text
                    x={0}
                    y={0}
                    dy={4}
                    textAnchor="end"
                    fill="currentColor"
                    className="fill-muted-foreground text-xs"
                  >
                    {valueFormatter(payload.value)}
                  </text>
                </g>
              )}
              className="text-xs"
            />
          ) : null}
          {categories.map((category, i) => {
            const color = colors[i % colors.length];
            const categoryColor = `hsl(var(--${color}))`;
            return (
              <Bar
                key={category}
                name={category}
                type="linear"
                dataKey={category}
                stackId={stack ? 'a' : undefined}
                fill={categoryColor}
                isAnimationActive={showAnimation}
              />
            );
          })}
        </BarChartPrimitive>
      </div>
    );
  }
);

BarChart.displayName = 'BarChart';

export { BarChart };