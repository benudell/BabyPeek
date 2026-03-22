import { useEffect, useRef, useState } from 'react'

const PW = 38
const PH = 50
const PN = 12
const PT = PH + PN
const GAP = 4
const WORD_GAP = 20
const VW = 920
const PINK = '#FAA0A0'
const BLUE = '#87CEEB'
const STRING_COLOR = '#b89a72'
const SPARKLE_COLORS = ['#FAA0A0', '#87CEEB', '#fff', '#ffe066', '#ffc1d4', '#b8f0ff', '#ffb6c1']

function computeRow(words) {
  const chars = []
  words.forEach((w, wi) => {
    ;[...w].forEach(c => chars.push({ ch: c, isSpace: false }))
    if (wi < words.length - 1) chars.push({ ch: ' ', isSpace: true })
  })

  let x = 0
  const items = chars.map(item => {
    const result = { ...item, x }
    x += item.isSpace ? WORD_GAP : PW + GAP
    return result
  })

  const totalW = x - GAP
  const startX = (VW - totalW) / 2
  return items.map(item => ({ ...item, x: item.x + startX }))
}

function BannerRow({ words, yBase, globalOffset }) {
  const items = computeRow(words)
  const pennants = items.filter(i => !i.isSpace)
  const firstX = pennants[0].x
  const lastX = pennants[pennants.length - 1].x + PW
  const stringY = yBase

  let colorIndex = 0

  return (
    <g>
      <path
        d={`M ${firstX - 30},${stringY - 4} Q ${VW / 2},${stringY + 10} ${lastX + 30},${stringY - 4}`}
        fill="none"
        stroke={STRING_COLOR}
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 1,0.5; 0,0; -1,0.5; 0,0"
          dur="5s"
          repeatCount="indefinite"
        />
      </path>

      {pennants.map((item, pi) => {
        const x = item.x
        const cx = x + PW / 2
        const color = colorIndex++ % 2 === 0 ? PINK : BLUE
        const shape = `M${x},${stringY} L${x + PW},${stringY} L${x + PW},${stringY + PH} L${cx},${stringY + PT} L${x},${stringY + PH} Z`
        const delay = `${((pi + globalOffset) * 0.18) % 3.6}s`

        return (
          <g key={pi}>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={`-1,${cx},${stringY}; 1.2,${cx},${stringY}; -0.5,${cx},${stringY}; 1,${cx},${stringY}; -1,${cx},${stringY}`}
              dur="5s"
              begin={delay}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
            />
            <path d={shape} fill="rgba(0,0,0,0.12)" transform="translate(2,3)" />
            <path d={shape} fill={color} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <circle cx={cx} cy={stringY} r="3.5" fill={STRING_COLOR} />
            <text
              x={cx}
              y={stringY + PH * 0.56}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Nunito, sans-serif"
              fontWeight="900"
              fontSize="21"
              fill="white"
            >
              {item.ch}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function PixieDust({ x, y, color, size, drift, spin, duration }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        color,
        fontSize: size,
        lineHeight: 1,
        pointerEvents: 'none',
        textShadow: `0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}`,
        animation: `banner-sparkle ${duration}s ease-in forwards`,
        zIndex: 200,
        '--drift': drift,
        '--spin': spin,
      }}
    >
      ✦
    </div>
  )
}

export default function BannerHeadline() {
  const svgRef = useRef(null)
  const wrapperRef = useRef(null)
  const [sparkles, setSparkles] = useState([])
  const sparkleIdRef = useRef(0)

  const row1 = ['HELP', 'US', 'CELEBRATE']
  const row2 = ['BABY', 'DOOLIN', 'PIERSON']
  const rowHeight = PT + 28
  const VH = rowHeight * 2 + 20

  // All pennant SVG-coordinate centers
  const allPennantCenters = []
  ;[row1, row2].forEach((words, ri) => {
    const yBase = ri === 0 ? 14 : 14 + rowHeight
    computeRow(words)
      .filter(i => !i.isSpace)
      .forEach(p => allPennantCenters.push({ svgX: p.x + PW / 2, svgY: yBase + PH * 0.4 }))
  })

  useEffect(() => {
    const interval = setInterval(() => {
      if (!svgRef.current) return
      const svgRect = svgRef.current.getBoundingClientRect()
      const scale = svgRect.width / VW

      const count = Math.floor(Math.random() * 3) + 2
      const newSparkles = []
      for (let i = 0; i < count; i++) {
        const p = allPennantCenters[Math.floor(Math.random() * allPennantCenters.length)]
        const x = svgRect.left + p.svgX * scale + (Math.random() - 0.5) * 24
        const y = svgRect.top + p.svgY * scale + (Math.random() - 0.5) * 12
        const driftPx = Math.round((Math.random() - 0.5) * 80)
        const spinDeg = Math.round(Math.random() * 360 * (Math.random() < 0.5 ? 1 : -1))
        newSparkles.push({
          id: sparkleIdRef.current++,
          x,
          y,
          color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
          size: Math.floor(Math.random() * 10) + 6,
          drift: `${driftPx}px`,
          spin: `${spinDeg}deg`,
          duration: (Math.random() * 1.2 + 1.4).toFixed(2),
        })
      }
      setSparkles(prev => [...prev.slice(-80), ...newSparkles])
    }, 180)

    return () => clearInterval(interval)
  }, [])

  return (
    <div ref={wrapperRef} className="w-full px-2 pt-6 pb-1" style={{ position: 'relative', overflow: 'visible' }}>
      <style>{`
        @keyframes banner-sparkle {
          0%   { opacity: 1;   transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          80%  { opacity: 0.6; }
          100% { opacity: 0;   transform: translate(var(--drift), 320px) scale(0.4) rotate(var(--spin)); }
        }
      `}</style>

        {sparkles.map(s => <PixieDust key={s.id} {...s} />)}

      <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ overflow: 'visible' }}>
        <BannerRow words={row1} yBase={14} globalOffset={0} />
        <BannerRow words={row2} yBase={14 + rowHeight} globalOffset={7} />
      </svg>

      <p className="text-center text-gray-400 text-sm tracking-widest uppercase mt-1 mb-3" style={{ letterSpacing: '0.18em' }}>
        help us dream about our beautiful child
      </p>
    </div>
  )
}
