import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

// ─── Simple pseudo-noise using layered sine waves ───
const noise3D = (x, y, z, t) => {
  return (
    Math.sin(x * 1.2 + t * 0.3) * 0.5 +
    Math.sin(y * 0.8 + t * 0.2 + 1.7) * 0.5 +
    Math.sin(z * 1.0 + t * 0.25 + 3.1) * 0.5 +
    Math.sin((x + y) * 0.7 + t * 0.15 + 2.3) * 0.3 +
    Math.sin((y + z) * 0.9 + t * 0.18 + 4.7) * 0.3
  ) * 0.25
}

// ─── Colors ───
const ACCENT = new THREE.Color('#3ECF8E')
const ACCENT_MUTED = new THREE.Color('#8FE3B8')
const WARM_WHITE = new THREE.Color('#F3F5F2')
const BG_COLOR = new THREE.Color('#0B0D0C')
const LINE_COLOR = new THREE.Color('#8FE3B8')

// ─── Particle System with drift motion ───
const ParticleField = ({ count, isMobile }) => {
  const pointsRef = useRef()
  const linesRef = useRef()
  const pointsMaterialRef = useRef()
  const linesMaterialRef = useRef()
  const mouseTarget = useRef({ x: 0, y: 0 })
  const mouseCurrent = useRef({ x: 0, y: 0 })
  const frameCount = useRef(0)

  // Programmatic circular soft dot texture
  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  // Generate initial particle positions and per-particle data
  const { positions, basePositions, colors, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const basePositions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const seeds = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Scatter in 3D space — depth -5 to -15
      const x = (Math.random() - 0.5) * 16
      const y = (Math.random() - 0.5) * 10
      const z = -5 - Math.random() * 10

      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z

      basePositions[i3] = x
      basePositions[i3 + 1] = y
      basePositions[i3 + 2] = z

      seeds[i3] = Math.random() * 100
      seeds[i3 + 1] = Math.random() * 100
      seeds[i3 + 2] = Math.random() * 100

      const r = Math.random()
      let color
      if (r < 0.35) color = ACCENT
      else if (r < 0.65) color = ACCENT_MUTED
      else color = WARM_WHITE

      const dimFactor = color === WARM_WHITE ? 0.2 + Math.random() * 0.2 : 0.4 + Math.random() * 0.4

      colors[i3] = color.r * dimFactor
      colors[i3 + 1] = color.g * dimFactor
      colors[i3 + 2] = color.b * dimFactor
    }

    return { positions, basePositions, colors, seeds }
  }, [count])

  const linePositions = useRef(new Float32Array(count * count * 6))
  const lineGeometry = useRef()

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouseTarget.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const time = state.clock.elapsedTime
    const positionAttr = pointsRef.current.geometry.attributes.position
    const posArray = positionAttr.array
    frameCount.current++

    // Lerp mouse for smooth damping
    mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.02
    mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.02

    const mx = mouseCurrent.current.x * 0.8
    const my = mouseCurrent.current.y * 0.5

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const sx = seeds[i3]
      const sy = seeds[i3 + 1]
      const sz = seeds[i3 + 2]

      const driftX = noise3D(sx, sy, sz, time * 0.2) * 0.5
      const driftY = noise3D(sx + 50, sy + 50, sz + 50, time * 0.15) * 0.4
      const driftZ = noise3D(sx + 100, sy + 100, sz + 100, time * 0.1) * 0.3

      const depth = Math.abs(basePositions[i3 + 2])
      const depthFactor = 1.0 - (depth - 5) / 10

      posArray[i3] = basePositions[i3] + driftX + mx * depthFactor
      posArray[i3 + 1] = basePositions[i3 + 1] + driftY + my * depthFactor
      posArray[i3 + 2] = basePositions[i3 + 2] + driftZ
    }
    positionAttr.needsUpdate = true

    // Connection lines (desktop only, throttled)
    if (!isMobile && linesRef.current && frameCount.current % 3 === 0) {
      const threshold = 2.5
      const thresholdSq = threshold * threshold
      let lineIdx = 0
      const maxLines = 180 

      for (let i = 0; i < count && lineIdx < maxLines; i++) {
        for (let j = i + 1; j < count && lineIdx < maxLines; j++) {
          const i3 = i * 3
          const j3 = j * 3
          const dx = posArray[i3] - posArray[j3]
          const dy = posArray[i3 + 1] - posArray[j3 + 1]
          const dz = posArray[i3 + 2] - posArray[j3 + 2]
          const distSq = dx * dx + dy * dy + dz * dz

          if (distSq < thresholdSq) {
            const li = lineIdx * 6
            linePositions.current[li] = posArray[i3]
            linePositions.current[li + 1] = posArray[i3 + 1]
            linePositions.current[li + 2] = posArray[i3 + 2]
            linePositions.current[li + 3] = posArray[j3]
            linePositions.current[li + 4] = posArray[j3 + 1]
            linePositions.current[li + 5] = posArray[j3 + 2]
            lineIdx++
          }
        }
      }

      if (lineGeometry.current) {
        lineGeometry.current.setAttribute(
          'position',
          new THREE.BufferAttribute(linePositions.current.slice(0, lineIdx * 6), 3)
        )
        lineGeometry.current.setDrawRange(0, lineIdx * 2)
        lineGeometry.current.computeBoundingSphere()
      }
    }
  })

  // GSAP entrance animation
  useEffect(() => {
    if (pointsMaterialRef.current) {
      pointsMaterialRef.current.opacity = 0
    }
    if (linesMaterialRef.current) {
      linesMaterialRef.current.opacity = 0
    }

    const anims = []

    if (pointsMaterialRef.current) {
      anims.push(
        gsap.to(pointsMaterialRef.current, {
          opacity: 0.7,
          duration: 1.5,
          ease: 'power2.out',
        })
      )
    }

    if (linesMaterialRef.current) {
      anims.push(
        gsap.to(linesMaterialRef.current, {
          opacity: 0.12,
          duration: 1.5,
          ease: 'power2.out',
        })
      )
    }

    return () => {
      anims.forEach((anim) => anim.kill())
    }
  }, [])

  // Clean up texture when unmounted
  useEffect(() => {
    return () => {
      circleTexture.dispose()
    }
  }, [circleTexture])

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMaterialRef}
          vertexColors
          transparent
          opacity={0}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          size={0.15} 
          map={circleTexture}
        />
      </points>

      {!isMobile && (
        <lineSegments ref={linesRef}>
          <bufferGeometry ref={lineGeometry} />
          <lineBasicMaterial
            ref={linesMaterialRef}
            color={LINE_COLOR}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      )}
    </group>
  )
}

const Scene = ({ count, isMobile }) => {
  const { scene } = useThree()

  useEffect(() => {
    scene.fog = new THREE.FogExp2(BG_COLOR, 0.08)
    return () => {
      scene.fog = null
    }
  }, [scene])

  return <ParticleField count={count} isMobile={isMobile} />
}

const StaticGradient = () => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      background:
        'radial-gradient(ellipse at 30% 50%, rgba(62,207,142,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(143,227,184,0.04) 0%, transparent 50%), #0B0D0C',
    }}
  />
)

const HeroBackground = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(motionQuery.matches)
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches)
    motionQuery.addEventListener('change', handleMotionChange)

    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  if (prefersReducedMotion) {
    return <StaticGradient />
  }

  const particleCount = isMobile ? 80 : 180

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: '#0B0D0C',
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 60, near: 0.1, far: 50 }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: false,
        }}
        style={{ background: '#0B0D0C' }}
      >
        <Scene count={particleCount} isMobile={isMobile} />
      </Canvas>
    </div>
  )
}

export default HeroBackground
