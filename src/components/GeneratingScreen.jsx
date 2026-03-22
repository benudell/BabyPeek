import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'

const MESSAGES = [
  'The stork is on the way...',
  'Mixing the best of both parents...',
  'Blending features with love...',
  'Adding a sprinkle of magic...',
  'Almost ready to meet your little one...',
  'Just a few more finishing touches...',
]

const SPARKLE_COLORS = ['#FAA0A0', '#87CEEB', '#fff', '#ffe066', '#ffc1d4', '#b8f0ff', '#ffb347']

function StorkSVG({ facingLeft }) {
  return (
    <>
      <style>{`
        @keyframes wing-flap-up {
          0%, 100% { transform: rotate(-30deg); }
          50%       { transform: rotate(22deg);  }
        }
        @keyframes wing-flap-lo {
          0%, 100% { transform: rotate(22deg);  }
          50%       { transform: rotate(-30deg); }
        }
        .su { transform-origin: 72px 35px; animation: wing-flap-up 0.32s ease-in-out infinite; }
        .sl { transform-origin: 72px 41px; animation: wing-flap-lo 0.32s ease-in-out infinite; }
      `}</style>
      <svg
        viewBox="0 0 160 85"
        width="160"
        height="85"
        style={{
          overflow: 'visible',
          transform: facingLeft ? 'scaleX(-1)' : 'none',
          filter: 'drop-shadow(0 0 12px rgba(250,160,160,0.7))',
          display: 'block',
        }}
      >
        {/* Body */}
        <ellipse cx="72" cy="40" rx="35" ry="14" fill="white" />

        {/* Upper wing */}
        <g className="su">
          <path d="M72,35 Q50,16 16,8 Q4,5 1,11" fill="#f0f0f0" stroke="#ddd" strokeWidth="0.5" />
          {/* Black wing-tip feathers */}
          <path d="M1,11 Q4,5 16,8 L13,17 Q7,15 1,11 Z" fill="#111" />
          <path d="M22,11 Q32,9 42,13 L40,20 Q30,16 20,19 Z" fill="#111" />
        </g>

        {/* Lower wing */}
        <g className="sl">
          <path d="M72,41 Q50,57 16,65 Q4,68 1,63" fill="#e8e8e8" stroke="#d0d0d0" strokeWidth="0.5" />
        </g>

        {/* Neck */}
        <path d="M100,33 C112,26 120,22 126,20" stroke="white" strokeWidth="9" fill="none" strokeLinecap="round" />

        {/* Head */}
        <ellipse cx="130" cy="18" rx="7" ry="6" fill="white" />

        {/* Eye */}
        <circle cx="133" cy="16" r="2.2" fill="#222" />
        <circle cx="134" cy="15.2" r="0.8" fill="white" />

        {/* Beak */}
        <path d="M135,18 L152,20" stroke="#E05A0A" strokeWidth="5" fill="none" strokeLinecap="round" />

        {/* Red beak stripe */}
        <path d="M135,18 L142,19" stroke="#c04000" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Legs trailing */}
        <path d="M48,52 L34,68 M34,68 L29,68 M34,68 L32,73"
          stroke="#E05A0A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M58,53 L44,69 M44,69 L39,69 M44,69 L42,74"
          stroke="#E05A0A" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Baby bundle hanging from beak */}
        <path d="M149,22 Q152,32 150,38" stroke="#aaa" strokeWidth="1.5" fill="none" strokeDasharray="2,2" />
        <circle cx="150" cy="41" r="7" fill="#FAA0A0" opacity="0.9" />
        <path d="M145,38 Q150,35 155,38" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </>
  )
}

function Sparkle({ x, y, color, size }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        fontSize: size,
        color,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 98,
        lineHeight: 1,
        textShadow: `0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}`,
        animation: 'sparkle-out 1.1s ease-out forwards',
      }}
    >
      ✦
    </div>
  )
}

export default function GeneratingScreen({ error, onBack }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [sparkles, setSparkles] = useState([])
  const angleRef = useRef(0)
  const frameRef = useRef(null)
  const sparkleIdRef = useRef(0)
  const storkRef = useRef(null)
  const lastSparkleTime = useRef(0)
  const [facingLeft, setFacingLeft] = useState(false)

  useEffect(() => {
    if (error) return

    const msgInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % MESSAGES.length)
    }, 3000)

    const animate = (timestamp) => {
      angleRef.current += 0.010
      const a = angleRef.current

      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const rx = Math.min(window.innerWidth * 0.40, 280)
      const ry = Math.min(window.innerHeight * 0.26, 155)

      const x = cx + Math.cos(a) * rx
      const y = cy + Math.sin(a) * ry

      setFacingLeft(Math.sin(a) > 0)

      if (storkRef.current) {
        storkRef.current.style.left = `${x}px`
        storkRef.current.style.top = `${y}px`
      }

      // Spawn sparkles
      if (timestamp - lastSparkleTime.current > 60) {
        lastSparkleTime.current = timestamp
        const id = sparkleIdRef.current++
        const color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)]
        const size = Math.floor(Math.random() * 14) + 8
        setSparkles(prev => [
          ...prev.slice(-40),
          {
            id,
            x: x + (Math.random() - 0.5) * 30,
            y: y + (Math.random() - 0.5) * 30,
            color,
            size,
          },
        ])
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    // Occasional glitter burst
    const burstInterval = setInterval(() => {
      const a = angleRef.current
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const rx = Math.min(window.innerWidth * 0.40, 280)
      const ry = Math.min(window.innerHeight * 0.26, 155)
      confetti({
        particleCount: 22,
        spread: 60,
        origin: {
          x: (cx + Math.cos(a) * rx) / window.innerWidth,
          y: (cy + Math.sin(a) * ry) / window.innerHeight,
        },
        colors: ['#FAA0A0', '#87CEEB', '#fff', '#ffe066', '#ffc1d4'],
        scalar: 0.6,
        gravity: 0.4,
        shapes: ['star', 'circle'],
      })
    }, 2000)

    return () => {
      clearInterval(msgInterval)
      clearInterval(burstInterval)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [error])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl text-white font-body mb-3">Oops! Something went wrong</h2>
        <div className="bg-red-900/50 border border-red-700 rounded-2xl p-4 mb-6 max-w-md">
          <p className="text-red-300 text-sm font-body">{error}</p>
        </div>
        <button
          onClick={onBack}
          className="px-8 py-3 text-white rounded-full font-semibold font-body"
          style={{ background: '#FAA0A0' }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] text-center px-4 overflow-hidden">
      <style>{`
        @keyframes sparkle-out {
          0%   { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          100% { opacity: 0; transform: translate(-50%, -130%) scale(0.2) rotate(200deg); }
        }
      `}</style>

      {/* Sparkle trail */}
      {sparkles.map(s => <Sparkle key={s.id} {...s} />)}

      {/* Flying stork */}
      <div
        ref={storkRef}
        style={{
          position: 'fixed',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 99,
        }}
      >
        <StorkSVG facingLeft={facingLeft} />
      </div>

      {/* Center message */}
      <div className="relative z-10">
        <p className="text-white font-body text-2xl font-semibold mb-4">
          {MESSAGES[messageIndex]}
        </p>
        <div className="flex gap-1.5 justify-center">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: i % 2 === 0 ? '#FAA0A0' : '#87CEEB',
                animation: `pulse-soft 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
