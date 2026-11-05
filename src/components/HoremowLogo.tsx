import React from 'react';

interface HoremowLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const HoremowLogo: React.FC<HoremowLogoProps> = ({ 
  className = "w-10 h-10", 
  size,
  showText = false 
}) => {
  const customStyle = size ? { width: size, height: size } : undefined;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`} style={customStyle}>
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full drop-shadow-md select-none shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Ring */}
        <circle cx="250" cy="250" r="240" fill="#FFFFFF" stroke="#047857" strokeWidth="18" />
        <circle cx="250" cy="250" r="226" fill="none" stroke="#065F46" strokeWidth="4" />
        <circle cx="250" cy="250" r="172" fill="none" stroke="#047857" strokeWidth="8" />

        {/* Circular Curved Text Paths */}
        <defs>
          <path
            id="topArc"
            d="M 60,250 A 190,190 0 1,1 440,250"
            fill="none"
          />
          <path
            id="bottomArc"
            d="M 430,250 A 180,180 0 0,1 70,250"
            fill="none"
          />
          <linearGradient id="globeGrad" x1="120" y1="120" x2="380" y2="380" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Top Text: HOLINESS REVIVAL MOVEMENT WORLDWIDE */}
        <text fill="#0f172a" fontSize="25" fontWeight="900" fontFamily="sans-serif" letterSpacing="2">
          <textPath href="#topArc" startOffset="50%" textAnchor="middle">
            HOLINESS REVIVAL MOVEMENT WORLDWIDE
          </textPath>
        </text>

        {/* Bottom Text: HOREMOW */}
        <text fill="#0f172a" fontSize="32" fontWeight="900" fontFamily="sans-serif" letterSpacing="4">
          <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
            HOREMOW
          </textPath>
        </text>

        {/* Center Globe */}
        <circle cx="250" cy="250" r="145" fill="url(#globeGrad)" filter="url(#shadow)" />
        
        {/* Globe Latitude/Longitude Grid Lines */}
        <ellipse cx="250" cy="250" rx="145" ry="50" fill="none" stroke="#60A5FA" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
        <ellipse cx="250" cy="250" rx="75" ry="145" fill="none" stroke="#60A5FA" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
        <line x1="105" y1="250" x2="395" y2="250" stroke="#93C5FD" strokeWidth="2" opacity="0.7" />

        {/* Continents overlay (simplified vector representation) */}
        <path
          d="M 160,200 Q 180,160 210,180 Q 230,200 220,230 Q 180,250 160,200 Z 
             M 280,180 Q 320,160 340,190 Q 350,220 310,240 Q 290,210 280,180 Z
             M 240,290 Q 270,280 280,320 Q 250,360 230,330 Z"
          fill="#059669"
          opacity="0.85"
        />

        {/* Open Bible at Bottom of Globe */}
        <g filter="url(#shadow)" transform="translate(0, 40)">
          {/* Left Page */}
          <path
            d="M 250,320 Q 180,300 120,325 L 120,385 Q 180,360 250,380 Z"
            fill="#FEF3C7"
            stroke="#D97706"
            strokeWidth="3"
          />
          {/* Right Page */}
          <path
            d="M 250,320 Q 320,300 380,325 L 380,385 Q 320,360 250,380 Z"
            fill="#FEF3C7"
            stroke="#D97706"
            strokeWidth="3"
          />
          {/* Page Lines */}
          <path d="M 140,338 Q 180,322 235,338 M 140,352 Q 180,336 235,352" stroke="#B45309" strokeWidth="1.5" opacity="0.5" />
          <path d="M 360,338 Q 320,322 265,338 M 360,352 Q 320,336 265,352" stroke="#B45309" strokeWidth="1.5" opacity="0.5" />
          {/* Bible Spine & Ribbon */}
          <line x1="250" y1="320" x2="250" y2="380" stroke="#92400E" strokeWidth="4" />
          <path d="M 250,380 L 245,410 L 250,405 L 255,410 Z" fill="#DC2626" />
        </g>

        {/* White Cross on Globe with HRMW Letters */}
        <g filter="url(#shadow)">
          {/* Cross Shape */}
          <path
            d="M 225,130 H 275 V 195 H 335 V 245 H 275 V 360 H 225 V 245 H 165 V 195 H 225 Z"
            fill="#FFFFFF"
            stroke="#020617"
            strokeWidth="6"
            strokeLinejoin="miter"
          />
          {/* H R M W Bold Black Letters */}
          <text x="195" y="180" fill="#020617" fontSize="38" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">H</text>
          <text x="305" y="180" fill="#020617" fontSize="38" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">R</text>
          <text x="195" y="300" fill="#020617" fontSize="38" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">M</text>
          <text x="305" y="300" fill="#020617" fontSize="38" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">W</text>
        </g>
      </svg>

      {showText && (
        <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white sepia-mode:text-amber-950">
          HOREMOW
        </span>
      )}
    </div>
  );
};
