import React from 'react';
import { AreaChart as AreaChartPrimitive } from '@tremor/react';
import { Area, Dot, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import { ChartTooltip } from '@/components/charts/ChartTooltip';

const AreaChart = React.forwardRef(
  (
    {
      data = [],
      categories = [],
      index,
      colors = [],
      valueFormatter = (value) => value.toString(),
      startEndOnly = false,
      showXAxis = true,
      showYAxis = true,
      yAxisWidth = 56,
      showAnimation = true,
      showGradient = true,
      showGridLines = true,
      showLegend = true,
      showTooltip = true,
      className,
      ...props
    },
    forwardedRef
  ) => {
    const chartRef = React.useRef(null);
    const [legendHeight, setLegendHeight] = React.useState(60);

    const activeDot = null;
    const activeLegend = undefined;

    const yAxisDomain = [0, 'auto'];
    const categoryColors = new Map();
    const resolvedColors = colors;

    return (
      <div
        ref={forwardedRef}
        className={cn('h-80 w-full', className)}
        {...props}
      >
        <AreaChartPrimitive
          ref={chartRef}
          data={data}
          index={index}
          categories={categories}
          colors={resolvedColors}
          valueFormatter={valueFormatter}
          startEndOnly={startEndOnly}
          showXAxis={showXAxis}
          showYAxis={showYAxis}
          yAxisWidth={yAxisWidth}
          showAnimation={showAnimation}
          showGradient={showGradient}
          showGridLines={showGridLines}
          showLegend={false}
          showTooltip={showTooltip}
          className="h-full"
          customTooltip={(props) => <ChartTooltip {...props} valueFormatter={valueFormatter} />}
        >
          {showGridLines ? (
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
          {categories.map((category) => {
            const color = resolvedColors[categories.indexOf(category) % resolvedColors.length];
            const categoryColor = `hsl(var(--${color}))`;
            return (
              <defs key={category}>
                <linearGradient
                  id={categoryColors.get(category)}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  {showGradient ? (
                    <>
                      <stop offset="5%" stopColor={categoryColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={categoryColor} stopOpacity={0} />
                    </>
                  ) : (
                    <stop offset="0%" stopColor={categoryColor} stopOpacity={0.3} />
                  )}
                </linearGradient>
              </defs>
            );
          })}
          {categories.map((category) => {
            const color = resolvedColors[categories.indexOf(category) % resolvedColors.length];
            const categoryColor = `hsl(var(--${color}))`;
            return (
              <Area
                key={category}
                name={category}
                type="linear"
                dataKey={category}
                stroke={categoryColor}
                fill={categoryColor}
                strokeWidth={2}
                dot={({ cx, cy, payload, value }) => {
                  const active = activeDot?.name === payload.date && activeDot?.value === value;
                  return (
                    <Dot
                      key={payload.date}
                      cx={cx}
                      cy={cy}
                      r={5}
                      strokeWidth={2}
                      stroke={categoryColor}
                      fill="hsl(var(--background))"
                      className={cn(
                        'transition-opacity',
                        active ? 'opacity-100' : activeDot ? 'opacity-25' : 'opacity-100'
                      )}
                    />
                  );
                }}
                isAnimationActive={showAnimation}
              />
            );
          })}
        </AreaChartPrimitive>
      </div>
    );
  }
);

AreaChart.displayName = 'AreaChart';

export { AreaChart };