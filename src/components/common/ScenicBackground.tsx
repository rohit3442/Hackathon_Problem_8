import React from 'react';

export const ScenicBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Base Deep Forest Dark Tone */}
      <div className="absolute inset-0 bg-[#07110c]" />

      {/* Atmospheric Vector Mountain Landscape */}
      <svg
        className="absolute inset-0 w-full h-full object-cover opacity-90"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky & Horizon Gradient */}
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2e24" />
            <stop offset="25%" stopColor="#13241b" />
            <stop offset="60%" stopColor="#0a150f" />
            <stop offset="100%" stopColor="#050a07" />
          </linearGradient>

          {/* Distant Mountain Ridge 1 */}
          <linearGradient id="ridgeFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#254233" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0f1f17" stopOpacity="0.9" />
          </linearGradient>

          {/* Mid Mountain Ridge 2 */}
          <linearGradient id="ridgeMid1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b3528" />
            <stop offset="100%" stopColor="#0b1812" />
          </linearGradient>

          {/* Mid Mountain Ridge 3 */}
          <linearGradient id="ridgeMid2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#142a1f" />
            <stop offset="100%" stopColor="#08120d" />
          </linearGradient>

          {/* Near Mountain Ridge 4 */}
          <linearGradient id="ridgeNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f2017" />
            <stop offset="100%" stopColor="#040906" />
          </linearGradient>

          {/* River Glow Gradient */}
          <linearGradient id="riverGlow" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#45735b" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#2e5440" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#11251a" stopOpacity="0.1" />
          </linearGradient>

          {/* Ethereal Mist Gradients */}
          <radialGradient id="mist1" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#3d6b52" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#224231" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0a150f" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="mist2" cx="70%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#4d8065" stopOpacity="0.15" />
            <stop offset="60%" stopColor="#1e382b" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#08110b" stopOpacity="0" />
          </radialGradient>

          <filter id="atmosphericBlur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="30" />
          </filter>

          <filter id="softMist" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="45" />
          </filter>
        </defs>

        {/* Sky */}
        <rect width="1920" height="1080" fill="url(#skyGrad)" />

        {/* Horizon Light Subtle Wash */}
        <ellipse cx="960" cy="220" rx="900" ry="260" fill="url(#mist1)" filter="url(#softMist)" />

        {/* Distant Mountain Silhouettes (Layer 1) */}
        <path
          d="M0 340 Q 240 290 480 320 T 960 280 T 1440 330 T 1920 290 L 1920 1080 L 0 1080 Z"
          fill="url(#ridgeFar)"
        />

        {/* Distant Valley Mist */}
        <ellipse cx="1200" cy="360" rx="600" ry="90" fill="url(#mist2)" filter="url(#atmosphericBlur)" />
        <ellipse cx="400" cy="380" rx="500" ry="80" fill="url(#mist1)" filter="url(#atmosphericBlur)" />

        {/* Mid Mountain Silhouettes (Layer 2) */}
        <path
          d="M0 420 Q 280 370 560 430 T 1120 380 T 1680 440 T 1920 400 L 1920 1080 L 0 1080 Z"
          fill="url(#ridgeMid1)"
        />

        {/* River Winding Through the Valley */}
        <path
          d="M 980 380 Q 940 440 990 510 T 890 620 T 1020 750 T 880 920 T 960 1080"
          stroke="url(#riverGlow)"
          strokeWidth="38"
          fill="none"
          strokeLinecap="round"
          filter="url(#atmosphericBlur)"
        />
        <path
          d="M 980 380 Q 940 440 990 510 T 890 620 T 1020 750 T 880 920 T 960 1080"
          stroke="#4e8267"
          strokeOpacity="0.22"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
        />

        {/* Valley Mist Over River */}
        <ellipse cx="950" cy="540" rx="700" ry="110" fill="url(#mist1)" filter="url(#softMist)" />

        {/* Near Mountain Ridges (Layer 3) */}
        <path
          d="M0 520 Q 220 470 520 540 T 1080 480 T 1580 560 T 1920 490 L 1920 1080 L 0 1080 Z"
          fill="url(#ridgeMid2)"
        />

        {/* Foreground Ridge Slopes (Layer 4) */}
        <path
          d="M0 660 Q 320 580 720 690 T 1400 620 T 1920 700 L 1920 1080 L 0 1080 Z"
          fill="url(#ridgeNear)"
        />

        {/* Extreme Foreground Slopes (Layer 5) */}
        <path
          d="M0 820 Q 420 760 880 870 T 1640 810 T 1920 890 L 1920 1080 L 0 1080 Z"
          fill="#040906"
        />

        {/* Forest Canopy Texture Dots & Organic Trees Silhouettes */}
        <g fill="#020503" opacity="0.6">
          <ellipse cx="140" cy="810" rx="40" ry="25" />
          <ellipse cx="190" cy="800" rx="35" ry="22" />
          <ellipse cx="230" cy="820" rx="45" ry="28" />
          <ellipse cx="340" cy="780" rx="55" ry="32" />
          <ellipse cx="1680" cy="790" rx="60" ry="35" />
          <ellipse cx="1740" cy="780" rx="50" ry="30" />
          <ellipse cx="1820" cy="820" rx="70" ry="40" />
        </g>
      </svg>

      {/* Atmospheric Radial Vignette - Exactly matching the deep dark border aesthetic */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(6, 17, 12, 0.2) 0%, rgba(4, 12, 8, 0.65) 55%, rgba(2, 6, 4, 0.94) 100%)',
        }}
      />

      {/* Subtle Top Ambient Gradient */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[#030805]/80 to-transparent" />
      {/* Subtle Bottom Ambient Gradient */}
      <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-[#020503] via-[#020503]/80 to-transparent" />
    </div>
  );
};
