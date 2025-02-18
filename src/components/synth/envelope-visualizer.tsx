import * as React from 'react';
import { FC, SVGProps } from 'react';

interface EnvelopeVisualizerProps extends SVGProps<SVGSVGElement> {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export const EnvelopeVisualizer: FC<EnvelopeVisualizerProps> = ({ attack, decay, sustain, release, ...props }) => {
  // 优化视觉空间参数
  const width = 2350;
  const height = 1000;
  const padding = 60; // 只用于主曲线
  const effectiveWidth = width;
  const effectiveHeight = height;
  const curveWidth = width - padding * 2;
  const curveHeight = height - padding * 2;

  // 计算关键时间点（x坐标）- 使用对数映射使短时间更容易可视化
  const maxTime = 2; // 最大时间2秒
  const timeToX = (t: number) => {
    const logScale = Math.log10(t * 9 + 1) / Math.log10(10);
    return logScale * curveWidth * 0.4 + padding;
  };
  const sustainWidth = curveWidth * 0.2;

  // 计算关键点 - 添加中间控制点以获得更自然的曲线
  const startPoint = `${padding},${height - padding}`;
  const attackPoint = `${timeToX(attack)},${padding + 5}`; // 稍微偏移以避免完全到顶
  const decayPoint = `${timeToX(attack + decay)},${padding + (1 - sustain) * curveHeight}`;
  const sustainEnd = `${timeToX(attack + decay) + sustainWidth},${padding + (1 - sustain) * curveHeight}`;
  const releasePoint = `${timeToX(attack + decay) + sustainWidth + timeToX(release)},${height - padding}`;

  // 生成更自然的贝塞尔曲线路径
  const path = `
    M ${startPoint}
    C ${timeToX(attack * 0.2)},${height - padding} 
      ${timeToX(attack * 0.8)},${padding + 50} 
      ${attackPoint}
    C ${timeToX(attack + decay * 0.2)},${padding} 
      ${timeToX(attack + decay * 0.8)},${decayPoint.split(',')[1]} 
      ${decayPoint}
    L ${sustainEnd}
    C ${Number(sustainEnd.split(',')[0]) + 50},${sustainEnd.split(',')[1]} 
      ${Number(releasePoint.split(',')[0]) - 100},${Number(sustainEnd.split(',')[1]) + 50} 
      ${releasePoint}
  `;

  // 生成更细致的网格线
  const gridLines = [];
  const majorGridCount = 5;
  const minorGridCount = 20;

  // 主网格线
  for (let i = 1; i < majorGridCount; i++) {
    const x = (effectiveWidth * i) / majorGridCount;
    gridLines.push(
      <line
        key={`major-vertical-${i}`}
        x1={x}
        y1={0}
        x2={x}
        y2={effectiveHeight}
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.15"
      />
    );
    const y = (effectiveHeight * i) / majorGridCount;
    gridLines.push(
      <line
        key={`major-horizontal-${i}`}
        x1={0}
        y1={y}
        x2={effectiveWidth}
        y2={y}
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.15"
      />
    );
  }

  // 次网格线
  for (let i = 1; i < minorGridCount; i++) {
    const x = (effectiveWidth * i) / minorGridCount;
    gridLines.push(
      <line
        key={`minor-vertical-${i}`}
        x1={x}
        y1={0}
        x2={x}
        y2={effectiveHeight}
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.05"
      />
    );
    const y = (effectiveHeight * i) / minorGridCount;
    gridLines.push(
      <line
        key={`minor-horizontal-${i}`}
        x1={0}
        y1={y}
        x2={effectiveWidth}
        y2={y}
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.05"
      />
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`} width={width} height={height} {...props}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 背景网格 */}
      {gridLines}

      {/* 主曲线 */}
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
        filter="url(#glow)"
      />

      {/* 关键点 */}
      <circle cx={padding} cy={height - padding} r="24" fill="currentColor" opacity="0.8" />
      <circle cx={timeToX(attack)} cy={padding + 5} r="24" fill="currentColor" opacity="0.8" />
      <circle
        cx={timeToX(attack + decay)}
        cy={padding + (1 - sustain) * curveHeight}
        r="24"
        fill="currentColor"
        opacity="0.8"
      />
      <circle
        cx={timeToX(attack + decay) + sustainWidth}
        cy={padding + (1 - sustain) * curveHeight}
        r="24"
        fill="currentColor"
        opacity="0.8"
      />
      <circle
        cx={timeToX(attack + decay) + sustainWidth + timeToX(release)}
        cy={height - padding}
        r="24"
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  );
};
