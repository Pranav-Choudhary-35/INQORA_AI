import { useMemo } from 'react'

/**
 * Generates random box-shadow positions for star particles.
 * @param {number} n - Number of stars to generate
 * @returns {string} CSS box-shadow value
 */
const generateBoxShadows = (n) => {
  let value = `${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`
  for (let i = 2; i <= n; i++) {
    value += `, ${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`
  }
  return value
}

/**
 * Pure background layer — renders three parallax star layers
 * with a radial gradient atmosphere. No content overlay.
 *
 * @param {{ speed?: number, className?: string }} props
 */
const ParallaxStars = ({ speed = 1, className = '' }) => {
  const shadowsSmall  = useMemo(() => generateBoxShadows(700), [])
  const shadowsMedium = useMemo(() => generateBoxShadows(200), [])
  const shadowsBig    = useMemo(() => generateBoxShadows(100), [])

  return (
    <>
      {/* Keyframes + gradient — injected once per mount */}
      <style>{`
        .parallax-radial-bg {
          background: radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%);
        }
        @keyframes parallaxStarDrift {
          from { transform: translateY(0px); }
          to   { transform: translateY(-2000px); }
        }
      `}</style>

      {/* Radial gradient base */}
      <div className={`absolute inset-0 parallax-radial-bg ${className}`} />

      {/* Stars Layer 1 — small (1px), 700 particles, slowest */}
      <div
        className="absolute left-0 top-0 bg-transparent"
        style={{
          width: 1,
          height: 1,
          boxShadow: shadowsSmall,
          animation: `parallaxStarDrift ${50 / speed}s linear infinite`,
        }}
      >
        <div
          className="absolute bg-transparent"
          style={{ top: 2000, width: 1, height: 1, boxShadow: shadowsSmall }}
        />
      </div>

      {/* Stars Layer 2 — medium (2px), 200 particles */}
      <div
        className="absolute left-0 top-0 bg-transparent"
        style={{
          width: 2,
          height: 2,
          boxShadow: shadowsMedium,
          animation: `parallaxStarDrift ${100 / speed}s linear infinite`,
        }}
      >
        <div
          className="absolute bg-transparent"
          style={{ top: 2000, width: 2, height: 2, boxShadow: shadowsMedium }}
        />
      </div>

      {/* Stars Layer 3 — big (3px), 100 particles, fastest */}
      <div
        className="absolute left-0 top-0 bg-transparent"
        style={{
          width: 3,
          height: 3,
          boxShadow: shadowsBig,
          animation: `parallaxStarDrift ${150 / speed}s linear infinite`,
        }}
      >
        <div
          className="absolute bg-transparent"
          style={{ top: 2000, width: 3, height: 3, boxShadow: shadowsBig }}
        />
      </div>
    </>
  )
}

export default ParallaxStars
