import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, MeshReflectorMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Product3DViewerProps {
  category?: string;
  accentColor?: string;
  model3dUrl?: string;
}

// Procedural 3D Perfume Bottle Shape
function Perfume3DModel({ accentColor = '#d4af37' }: { accentColor?: string }) {
  const bottleGroup = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (bottleGroup.current) {
      bottleGroup.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.15;
    }
    if (liquidRef.current) {
      liquidRef.current.position.y = -0.08 + Math.sin(state.clock.elapsedTime * 1.2) * 0.015;
    }
  });

  return (
    <group ref={bottleGroup} position={[0, -0.3, 0]}>
      {/* Main Bottle Body: Tapered Cylinder */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.95, 2.3, 32]} />
        <meshPhysicalMaterial
          color="#fffaf0"
          transmission={0.92}
          transparent
          opacity={1}
          roughness={0.02}
          ior={1.52}
          thickness={0.8}
          reflectivity={0.9}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Inner Amber Fragrance Liquid */}
      <mesh ref={liquidRef} position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.7, 0.82, 1.9, 32]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.2}
          roughness={0.15}
          transparent
          opacity={0.85}
          emissive={accentColor}
          emissiveIntensity={0.18}
        />
      </mesh>

      {/* Gold Label Plaque */}
      <mesh position={[0, 0, 0.83]}>
        <planeGeometry args={[1.0, 1.0]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* Smaller Cylinder Neck */}
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.26, 0.3, 0.45, 32]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>

      {/* Atomizer Ring */}
      <mesh position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.12, 32]} />
        <meshStandardMaterial
          color="#f2d399"
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Gold-Colored Rounded Cap */}
      <group position={[0, 2.1, 0]}>
        <mesh>
          <sphereGeometry args={[0.48, 32, 32]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.95}
            roughness={0.08}
          />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.2, 32]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.95}
            roughness={0.08}
          />
        </mesh>
      </group>
    </group>
  );
}

// Procedural 3D Jewelry Ring Shape
function Jewelry3DModel() {
  const ringGroup = useRef<THREE.Group>(null);
  const gemRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringGroup.current) {
      ringGroup.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15 + 0.25;
      ringGroup.current.rotation.y = state.clock.elapsedTime * 0.25;
    }
    if (gemRef.current) {
      gemRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={ringGroup} position={[0, -0.1, 0]} scale={1.25}>
      {/* 18K Metallic Gold Torus Ring Band */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.18, 32, 64]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.96}
          roughness={0.12}
        />
      </mesh>

      {/* Crown Setting Base */}
      <mesh position={[0, 1.32, 0]}>
        <cylinderGeometry args={[0.45, 0.22, 0.38, 6]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>

      {/* Gold Setting Prongs */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(angle) * 0.32,
            1.55,
            Math.cos(angle) * 0.32
          ]}
        >
          <cylinderGeometry args={[0.04, 0.04, 0.35, 16]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.96}
            roughness={0.08}
          />
        </mesh>
      ))}

      {/* Faceted Solitaire Diamond Gemstone with Emissive Sparkle */}
      <mesh ref={gemRef} position={[0, 1.78, 0]}>
        <octahedronGeometry args={[0.62, 2]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.98}
          transparent
          opacity={1}
          roughness={0.02}
          ior={2.42}
          reflectivity={1}
          clearcoat={1}
          clearcoatRoughness={0.02}
          emissive="#ffd700"
          emissiveIntensity={0.25}
        />
      </mesh>
    </group>
  );
}

export default function Product3DViewer({ category = 'perfume', accentColor = '#d4af37' }: Product3DViewerProps) {
  const isPerfume = category.toLowerCase() === 'perfume';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '440px' }}>
      <Canvas
        camera={{ position: [0, 1, 6.2], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        {/* Main Studio Key Light */}
        <directionalLight position={[5, 8, 5]} intensity={2.0} color="#fff6e5" />
        {/* Warm Gold-Tinted Rim Light */}
        <pointLight position={[-6, 3, -5]} intensity={1.8} color="#ffd478" />
        {/* Top Focus Spot Light */}
        <spotLight position={[0, 10, 2]} intensity={2.2} angle={0.4} penumbra={0.8} color="#ffffff" />

        {/* Studio Environment Reflections */}
        <Environment preset="studio" environmentIntensity={0.6} />

        <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.4}>
          {isPerfume ? (
            <Perfume3DModel accentColor={accentColor} />
          ) : (
            <Jewelry3DModel />
          )}
        </Float>

        <Sparkles
          count={50}
          scale={[7, 7, 7]}
          size={2.2}
          speed={0.4}
          opacity={0.55}
          color="#d4af37"
        />

        {/* Reflective Base */}
        <mesh position={[0, -2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[18, 18]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={512}
            mirror={0.45}
            mixBlur={0.8}
            mixStrength={1.5}
            roughness={0.6}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#0d0d0d"
            metalness={0.8}
          />
        </mesh>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={1.0}
          minDistance={3.2}
          maxDistance={9.0}
          maxPolarAngle={Math.PI / 2 + 0.1}
        />
      </Canvas>

      {/* Guide label */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          color: 'var(--text-muted)',
          fontSize: '0.68rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(13, 13, 13, 0.7)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid rgba(212, 175, 55, 0.25)'
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-gold)' }}></span>
        Drag to rotate • Pinch/Scroll to zoom
      </div>
    </div>
  );
}

