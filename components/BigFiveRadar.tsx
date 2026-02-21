import React from 'react';

interface BigFiveRadarProps {
  data: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    stability: number;
  };
}

export const BigFiveRadar: React.FC<BigFiveRadarProps> = ({ data }) => {
  // Strategy: Massive SVG container (320px) with a controlled chart radius (70px).
  // This leaves (160 - 70) = 90px of margin ON EACH SIDE specifically for labels.
  const size = 320; 
  const center = size / 2;
  const radius = 70; 
  const levels = [20, 40, 60, 80, 100]; 

  const axes = [
    { label: 'Abertura', value: data.openness, color: '#3b82f6' },
    { label: 'Disciplina', value: data.conscientiousness, color: '#10b981' },
    { label: 'Extroversão', value: data.extraversion, color: '#FF7F47' }, // Adjusted to brand
    { label: 'Amabilidade', value: data.agreeableness, color: '#ec4899' },
    { label: 'Estabilidade', value: data.stability, color: '#6366f1' },
  ];

  const angleSlice = (Math.PI * 2) / axes.length;

  const getCoordinates = (value: number, index: number) => {
    const angle = index * angleSlice - Math.PI / 2; 
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const getPath = (values: number[]) => {
    return values.map((val, i) => {
      const { x, y } = getCoordinates(val, i);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z';
  };

  const dataValues = axes.map(a => a.value);
  const shapePath = getPath(dataValues);

  return (
    <div className="flex flex-col items-center justify-center relative -my-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background Web */}
        {levels.map((level, i) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 100) * radius}
            fill="transparent"
            stroke="#e2e8f0" 
            strokeWidth="1"
            strokeDasharray={i === levels.length - 1 ? "0" : "4 2"}
          />
        ))}

        {/* Axes Lines */}
        {axes.map((_, i) => {
          const { x, y } = getCoordinates(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Shape */}
        <path
          d={shapePath}
          fill="rgba(255, 127, 71, 0.15)" 
          stroke="#FF7F47"
          strokeWidth="3"
          className="drop-shadow-md transition-all duration-1000 ease-out"
        />

        {/* Data Points */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(axis.value, i);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="5"
              fill={axis.color}
              stroke="white"
              strokeWidth="2"
              className="hover:scale-125 transition-transform cursor-pointer shadow-sm"
            >
              <title>{axis.label}: {axis.value}%</title>
            </circle>
          );
        })}

        {/* Labels - Positioned safely within the large canvas */}
        {axes.map((axis, i) => {
          const angle = index => index * angleSlice - Math.PI / 2;
          const labelRadius = radius + 25; 
          const x = center + labelRadius * Math.cos(angle(i));
          const y = center + labelRadius * Math.sin(angle(i));
          
          const anchor = x < center - 10 ? 'end' : x > center + 10 ? 'start' : 'middle';

          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor={anchor}
              dy="0.35em"
              className="text-[11px] font-bold fill-slate-500 uppercase tracking-widest"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};