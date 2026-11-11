import React, { useId } from 'react';

const SIZE_MAP = {
  sm: {
    mark: 22,
    text: 'text-[15px]',
    gap: 'space-x-2',
    degree: 'w-1 h-1 border-[1.25px] ml-[2px] -mt-[1px]',
  },
  md: {
    mark: 32,
    text: 'text-[17px]',
    gap: 'space-x-2.5',
    degree: 'w-[5px] h-[5px] border-[1.5px] ml-[2px] -mt-[1px]',
  },
  lg: {
    mark: 40,
    text: 'text-2xl',
    gap: 'space-x-3',
    degree: 'w-1.5 h-1.5 border-[1.75px] ml-[2.5px] mt-0',
  },
};

/**
 * Geometric 360-degree verification ring mark used in the logo lockup and favicon.
 */
export const BrandMark = ({ size = 32, className = '' }) => {
  const uid = useId().replace(/:/g, '');
  const bgId = `t360-bg-${uid}`;
  const borderId = `t360-border-${uid}`;
  const arcId = `t360-arc-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id={bgId} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#181820" />
          <stop offset="100%" stopColor="#09090B" />
        </linearGradient>
        <linearGradient id={borderId} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#434357" />
          <stop offset="100%" stopColor="#27272A" />
        </linearGradient>
        <linearGradient id={arcId} x1="6.4" y1="6.4" x2="25.4" y2="25.4" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="55%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>

      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8"
        fill={`url(#${bgId})`}
        stroke={`url(#${borderId})`}
        strokeWidth="1.2"
      />
      <path
        d="M 25.39 14.00 A 9.6 9.6 0 1 1 18.00 6.61"
        stroke={`url(#${arcId})`}
        strokeWidth="2.75"
        strokeLinecap="round"
      />
      <path
        d="M 11.4 16.4 L 14.6 19.6 L 20.5 12.1"
        stroke="#FAFAFA"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.8" cy="9.2" r="2.0" fill="#34D399" />
    </svg>
  );
};

/**
 * Primary Test360 brand lockup combining the geometric mark and formatted typographic wordmark.
 */
export const BrandLogo = ({
  size = 'md',
  showMark = true,
  hideWordmarkOnMobile = false,
  className = '',
}) => {
  const preset = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <span className={`inline-flex items-center ${preset.gap} select-none ${className}`}>
      {showMark && <BrandMark size={preset.mark} />}
      <span
        className={`${
          hideWordmarkOnMobile ? 'hidden sm:inline-flex' : 'inline-flex'
        } items-baseline font-sans ${preset.text} leading-none tracking-[-0.035em]`}
      >
        <span className="font-bold text-zinc-50">Test</span>
        <span className="font-semibold tracking-[-0.03em] bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-500 bg-clip-text text-transparent">
          360
        </span>
        <span
          aria-hidden="true"
          className={`inline-block rounded-full border-emerald-400 self-start shrink-0 ${preset.degree}`}
        />
      </span>
    </span>
  );
};

export default BrandLogo;

