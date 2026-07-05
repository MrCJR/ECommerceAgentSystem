import { Typography } from 'antd';

export interface TrendBarItem {
  value: number;
  max: number;
  title: string;
  className?: string;
  color?: string;
  minHeight?: number;
  width?: number;
}

export interface TrendPoint {
  key: string;
  label: string;
  bars: TrendBarItem[];
}

interface TrendBarChartProps {
  points: TrendPoint[];
  ariaLabel?: string;
  className?: string;
  barAreaHeight?: number;
  maxBarHeight?: number;
  labelMaxWidth?: number;
}

export function TrendBarChart({
  points,
  ariaLabel,
  className,
  barAreaHeight,
  maxBarHeight = 140,
  labelMaxWidth
}: TrendBarChartProps) {
  return (
    <div className={['trend-chart', className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      {points.map((point) => (
        <div className="trend-column" key={point.key}>
          <div className="trend-bars" style={barAreaHeight ? { height: barAreaHeight } : undefined}>
            {point.bars.map((bar, index) => (
              <span
                className={['trend-bar', bar.className].filter(Boolean).join(' ')}
                key={`${point.key}-${index}`}
                style={{
                  height: `${Math.max(bar.minHeight ?? 8, (bar.value / Math.max(bar.max, 1)) * maxBarHeight)}px`,
                  width: bar.width,
                  background: bar.color
                }}
                title={bar.title}
              />
            ))}
          </div>
          <Typography.Text
            type="secondary"
            style={labelMaxWidth ? { fontSize: 11, textAlign: 'center', maxWidth: labelMaxWidth, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : undefined}
          >
            {point.label}
          </Typography.Text>
        </div>
      ))}
    </div>
  );
}
