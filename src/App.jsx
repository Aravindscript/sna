import React, { useEffect, useRef, useState } from "react";
import "./style.css";

const BODY_COUNT = 34;
const GAP = 18;

function App() {
  const [screen, setScreen] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [pointer, setPointer] = useState({
    x: window.innerWidth * 0.72,
    y: window.innerHeight * 0.35,
  });

  const [points, setPoints] = useState(() =>
    Array.from({ length: BODY_COUNT }, (_, i) => ({
      x: window.innerWidth * 0.72 - i * GAP,
      y: window.innerHeight * 0.35,
    }))
  );

  const target = useRef({
    x: window.innerWidth * 0.72,
    y: window.innerHeight * 0.35,
  });

  const animation = useRef(null);

  // Responsive screen size
  useEffect(() => {
    const resize = () => {
      setScreen({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  // Mouse and touch movement
  useEffect(() => {
    const move = (x, y) => {
      target.current = { x, y };
      setPointer({ x, y });
    };

    const mouseMove = (e) => move(e.clientX, e.clientY);

    const touchMove = (e) => {
      const touch = e.touches[0];

      if (touch) move(touch.clientX, touch.clientY);
    };

    const touchStart = (e) => {
      const touch = e.touches[0];

      if (touch) move(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("touchmove", touchMove, {
      passive: true,
    });
    window.addEventListener("touchstart", touchStart, {
      passive: true,
    });

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchstart", touchStart);
    };
  }, []);

  // Dragon movement
  useEffect(() => {
    let lastTime = 0;

    const animate = (time) => {
      const delta = lastTime
        ? Math.min((time - lastTime) / 16.67, 2)
        : 1;

      lastTime = time;

      setPoints((old) => {
        const next = old.map((p) => ({ ...p }));

        next[0] = {
          x:
            old[0].x +
            (target.current.x - old[0].x) *
              (1 - Math.pow(0.88, delta)),
          y:
            old[0].y +
            (target.current.y - old[0].y) *
              (1 - Math.pow(0.88, delta)),
        };

        for (let i = 1; i < BODY_COUNT; i++) {
          const leader = next[i - 1];
          const current = old[i];

          const dx = leader.x - current.x;
          const dy = leader.y - current.y;
          const distance = Math.hypot(dx, dy);

          if (distance > GAP) {
            const amount =
              (distance - GAP) * (1 - Math.pow(0.68, delta));

            next[i] = {
              x: current.x + (dx / distance) * amount,
              y: current.y + (dy / distance) * amount,
            };
          }
        }

        return next;
      });

      animation.current = requestAnimationFrame(animate);
    };

    animation.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animation.current);
  }, []);

  // Smooth body curve
  const createCurve = () => {
    if (points.length < 2) return "";

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];

      d += ` Q ${current.x} ${current.y} ${
        (current.x + next.x) / 2
      } ${(current.y + next.y) / 2}`;
    }

    const last = points[points.length - 1];

    d += ` L ${last.x} ${last.y}`;

    return d;
  };

  // Head direction
  const headAngle = () => {
    if (!points[1]) return 0;

    const dx = points[0].x - points[1].x;
    const dy = points[0].y - points[1].y;

    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const { width, height } = screen;

  return (
    <div className="page">
      <svg
        className="scene"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Dragon body */}
          <linearGradient id="redDragon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff7164" />
            <stop offset="40%" stopColor="#f3232b" />
            <stop offset="100%" stopColor="#76050c" />
          </linearGradient>

          {/* Wings */}
          <linearGradient id="wingGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff5744" />
            <stop offset="100%" stopColor="#69070b" />
          </linearGradient>

          {/* Eyes */}
          <radialGradient id="eye">
            <stop offset="0%" stopColor="#fff7a0" />
            <stop offset="55%" stopColor="#ffd21c" />
            <stop offset="100%" stopColor="#e48b00" />
          </radialGradient>

          {/* Fireball */}
          <radialGradient id="orbGradient">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fff9bb" />
            <stop offset="60%" stopColor="#ffb51b" />
            <stop offset="100%" stopColor="#ff3500" />
          </radialGradient>

          {/* Dark background */}
          <linearGradient id="fireFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#030306" />
            <stop offset="60%" stopColor="#100407" />
            <stop offset="100%" stopColor="#260500" />
          </linearGradient>

          {/* Fire gradients */}
          <linearGradient id="flameGradient1" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff1900" />
            <stop offset="35%" stopColor="#ff5100" />
            <stop offset="70%" stopColor="#ffad18" />
            <stop offset="100%" stopColor="#fff4bd" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="flameGradient2" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#a30900" />
            <stop offset="45%" stopColor="#ff3100" />
            <stop offset="78%" stopColor="#ff8d00" />
            <stop offset="100%" stopColor="#ffdc72" stopOpacity="0.05" />
          </linearGradient>

          {/* Realistic flame distortion */}
          <filter
            id="realFire"
            x="-20%"
            y="-20%"
            width="140%"
            height="150%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.035"
              numOctaves="2"
              seed="8"
              result="noise"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="17"
              xChannelSelector="R"
              yChannelSelector="G"
              result="distortedFire"
            />

            <feGaussianBlur
              in="distortedFire"
              stdDeviation="0.7"
            />
          </filter>

          {/* Fire haze */}
          <filter id="fireBlur">
            <feGaussianBlur stdDeviation="34" />
          </filter>

          {/* Dragon glow */}
          <filter
            id="redGlow"
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              in="SourceAlpha"
              stdDeviation="7"
              result="shadow"
            />

            <feFlood
              floodColor="#ff1708"
              floodOpacity="0.7"
              result="glowColor"
            />

            <feComposite
              in="glowColor"
              in2="shadow"
              operator="in"
              result="redHalo"
            />

            <feMerge>
              <feMergeNode in="redHalo" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ======================
            FIRE BACKGROUND
        ====================== */}

        {/* REALISTIC FIRE BACKGROUND */}
<defs>
  <linearGradient id="fireBase" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0%" stopColor="#fff9b0" />
    <stop offset="15%" stopColor="#ffec54" />
    <stop offset="38%" stopColor="#ff8c00" />
    <stop offset="68%" stopColor="#ff3000" />
    <stop offset="100%" stopColor="#720600" stopOpacity="0" />
  </linearGradient>

  <linearGradient id="fireCore" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0%" stopColor="#fffde0" />
    <stop offset="28%" stopColor="#fff4a0" />
    <stop offset="58%" stopColor="#ffad22" />
    <stop offset="100%" stopColor="#ff3700" stopOpacity="0" />
  </linearGradient>

  <radialGradient id="fireAtmosphere">
    <stop offset="0%" stopColor="#ff2900" stopOpacity=".5" />
    <stop offset="55%" stopColor="#8b0800" stopOpacity=".2" />
    <stop offset="100%" stopColor="#000" stopOpacity="0" />
  </radialGradient>

  <filter id="fireDistortion" x="-30%" y="-20%" width="160%" height="150%">
    <feTurbulence
      type="fractalNoise"
      baseFrequency=".012 .035"
      numOctaves="3"
      seed="8"
      result="noise"
    />
    <feDisplacementMap
      in="SourceGraphic"
      in2="noise"
      scale="24"
      xChannelSelector="R"
      yChannelSelector="G"
    />
  </filter>

  <filter id="fireBlur">
    <feGaussianBlur stdDeviation="18" />
  </filter>

  <filter id="fireDetailGlow" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="5" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>

{/* Black smoky atmosphere */}
<rect
  x="0"
  y="0"
  width={window.innerWidth}
  height={window.innerHeight}
  fill="#030303"
/>

<ellipse
  cx={window.innerWidth / 2}
  cy={window.innerHeight}
  rx={window.innerWidth * 0.8}
  ry={window.innerHeight * 0.65}
  fill="url(#fireAtmosphere)"
  filter="url(#fireBlur)"
/>

{/* Distant flames */}
<g
  className="fire-layer fire-back"
  filter="url(#fireDistortion)"
>
  {Array.from({ length: 15 }, (_, i) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = (i * w) / 15 - 25;
    const flameW = w / 10;
    const flameH = h * (0.2 + ((i * 7) % 5) * 0.055);

    return (
      <path
        key={`back-${i}`}
        d={`
          M ${x - flameW * 0.45} ${h}
          Q ${x - flameW * 0.75} ${h - flameH * 0.4}
            ${x - flameW * 0.15} ${h - flameH * 0.72}
          Q ${x + flameW * 0.05} ${h - flameH * 1.15}
            ${x + flameW * 0.2} ${h - flameH * 0.72}
          Q ${x + flameW * 0.85} ${h - flameH * 0.35}
            ${x + flameW * 0.5} ${h}
          Z
        `}
        fill="url(#fireBase)"
        opacity={0.72 + (i % 3) * 0.08}
      />
    );
  })}
</g>

{/* Main flames with irregular tips */}
<g
  className="fire-layer fire-front"
  filter="url(#fireDetailGlow)"
>
  {Array.from({ length: 21 }, (_, i) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = (i * w) / 21;
    const flameW = w / 13;
    const flameH = h * (0.15 + ((i * 11) % 7) * 0.045);

    return (
      <path
        key={`front-${i}`}
        className={`real-fire flame-${i % 4}`}
        style={{ animationDelay: `${-i * 0.19}s` }}
        d={`
          M ${x - flameW * 0.45} ${h + 10}
          C ${x - flameW * 0.65} ${h - flameH * 0.15},
            ${x - flameW * 0.1} ${h - flameH * 0.45},
            ${x - flameW * 0.18} ${h - flameH * 0.78}
          C ${x + flameW * 0.05} ${h - flameH * 0.62},
            ${x + flameW * 0.1} ${h - flameH * 1.08},
            ${x + flameW * 0.36} ${h - flameH * 0.7}
          C ${x + flameW * 0.82} ${h - flameH * 0.42},
            ${x + flameW * 0.58} ${h - flameH * 0.15},
            ${x + flameW * 0.65} ${h + 10}
          Z
        `}
        fill={i % 3 === 0 ? "url(#fireCore)" : "url(#fireBase)"}
        opacity={0.88 + (i % 3) * 0.04}
      />
    );
  })}
</g>

{/* Floating glowing embers */}
<g className="fire-embers">
  {Array.from({ length: 100 }, (_, i) => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    return (
      <circle
        key={`ember-${i}`}
        className="fire-ember"
        cx={(i * 137.51) % w}
        cy={h * 0.45 + ((i * 71.7) % (h * 0.55))}
        r={1 + (i % 3) * 0.65}
        fill={i % 4 === 0 ? "#fff3a0" : "#ff4a05"}
        style={{
          animationDelay: `${-(i % 15) * 0.37}s`,
          animationDuration: `${2 + (i % 5) * 0.55}s`
        }}
      />
    );
  })}
</g>

        {/* Body trail */}
        <path d={createCurve()} className="curve" />

        <g filter="url(#redGlow)">
          {/* Connected body */}
          <path d={createCurve()} className="dragon-spine" />

          {/* Body segments */}
          {points.map((p, index) => {
            if (index === 0) return null;

            const radius = Math.max(6, 18 - index * 0.36);

            return (
              <g key={index}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={radius}
                  className="body"
                />

                <circle
                  cx={p.x - radius * 0.3}
                  cy={p.y - radius * 0.3}
                  r={radius * 0.22}
                  className="shine"
                />
              </g>
            );
          })}

          {/* Wings */}
          {points[5] && (
            <g
              transform={`translate(${points[5].x} ${points[5].y})`}
              className="wings"
            >
              <path
                d="M0 5 C-28 -5 -60 -40 -92 -76
                C-82 -42 -90 -8 -68 28
                C-42 17 -18 10 0 5 Z"
                className="wing"
              />

              <path
                d="M0 5 C28 -5 60 -40 92 -76
                C82 -42 90 -8 68 28
                C42 17 18 10 0 5 Z"
                className="wing"
              />

              <path d="M0 5 L-76 -64" className="wingBone" />
              <path d="M0 5 L76 -64" className="wingBone" />
            </g>
          )}

          {/* Head */}
          {points[0] && (
            <g
              transform={`translate(${points[0].x} ${points[0].y}) rotate(${headAngle()})`}
            >
              <ellipse
                cx="-15"
                cy="0"
                rx="27"
                ry="18"
                className="neck"
              />

              <path
                d="M8 -22
                C25 -28 49 -21 57 -6
                C64 7 53 22 35 25
                C19 26 5 16 3 1
                C2 -9 3 -17 8 -22 Z"
                className="head"
              />

              <path
                d="M43 -9
                C60 -8 69 -1 65 8
                C60 15 48 13 39 8 Z"
                className="snout"
              />

              <path d="M15 -18 L2 -41 L25 -24 Z" className="horn" />
              <path d="M30 -22 L30 -43 L43 -18 Z" className="horn" />

              <ellipse cx="24" cy="-7" rx="5" ry="7" fill="url(#eye)" />
              <ellipse cx="41" cy="-6" rx="5" ry="7" fill="url(#eye)" />

              <ellipse cx="25" cy="-7" rx="1.5" ry="4" className="pupil" />
              <ellipse cx="42" cy="-6" rx="1.5" ry="4" className="pupil" />

              <path d="M42 10 Q54 15 63 7" className="mouth" />
              <path d="M51 10 L54 17 M57 10 L60 16" className="teeth" />
            </g>
          )}
        </g>

        {/* Golden fireball */}
        <g
          className="chase-object"
          transform={`translate(${pointer.x} ${pointer.y})`}
        >
          <circle className="chase-halo" r="22" />

          <g className="chase-spark">
            <path d="M0 -19 L4 -7 L0 -10 L-4 -7 Z" fill="#ffb52e" />
            <path d="M19 0 L7 4 L10 0 L7 -4 Z" fill="#ff7b16" />
            <path d="M0 19 L4 7 L0 10 L-4 7 Z" fill="#ffb52e" />
            <path d="M-19 0 L-7 4 L-10 0 L-7 -4 Z" fill="#ff7b16" />
          </g>

          <circle className="chase-orb" r="8" />
          <circle className="chase-core" cx="-2" cy="-2" r="2.5" />
        </g>
      </svg>
    </div>
  );
}

export default App;