import { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Environment, 
  Float, 
  MeshTransmissionMaterial,
  Html,
  ContactShadows
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import jarFallbackImage from '@/assets/jar-hero-fallback.jpg';

// Fairy light component with twinkling
function FairyLight({ position, phase, intensity = 0.4 }: { position: [number, number, number]; phase: number; intensity?: number }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    // Slow twinkle with random phase
    const twinkle = 0.6 + Math.sin(time * 0.6 + phase) * 0.25 + Math.sin(time * 1.1 + phase * 1.7) * 0.15;
    const scale = 0.7 + Math.sin(time * 0.6 + phase) * 0.3;
    
    if (lightRef.current) {
      lightRef.current.intensity = intensity * twinkle;
    }
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshBasicMaterial color="#FFD54F" transparent opacity={0.95} />
      </mesh>
      <pointLight
        ref={lightRef}
        color="#FFAB00"
        intensity={intensity}
        distance={0.6}
        decay={2}
      />
    </group>
  );
}

// Dense wire string for fairy lights - more tangled/organic
function LightWires() {
  const wires = useMemo(() => {
    const allWires: THREE.CatmullRomCurve3[] = [];
    // Create multiple interweaving wire strands
    for (let strand = 0; strand < 4; strand++) {
      const pts: THREE.Vector3[] = [];
      const offset = strand * 0.8;
      for (let i = 0; i < 25; i++) {
        const t = i / 24;
        const angle = t * Math.PI * 4 + offset;
        const radius = 0.15 + Math.sin(t * Math.PI * 2 + strand) * 0.12;
        const y = -0.45 + t * 0.9;
        pts.push(new THREE.Vector3(
          Math.cos(angle) * radius + (Math.random() - 0.5) * 0.05,
          y + (Math.random() - 0.5) * 0.03,
          Math.sin(angle) * radius + (Math.random() - 0.5) * 0.05
        ));
      }
      allWires.push(new THREE.CatmullRomCurve3(pts));
    }
    return allWires;
  }, []);

  return (
    <group>
      {wires.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 50, 0.003, 3, false]} />
          <meshBasicMaterial color="#8B6914" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// The main glass jar with all components
function GlassJar({ onHover }: { onHover?: (hovered: boolean) => void }) {
  const jarRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const breathingRef = useRef(0);

  useFrame((state) => {
    if (jarRef.current) {
      // Very slow, calm rotation
      jarRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
      
      // Subtle breathing movement
      breathingRef.current = Math.sin(state.clock.elapsedTime * 0.3) * 0.01;
      jarRef.current.position.y = breathingRef.current;
      
      // Parallax on hover
      if (hovered) {
        const targetRotX = state.pointer.y * 0.08;
        const targetRotZ = state.pointer.x * -0.04;
        jarRef.current.rotation.x = THREE.MathUtils.lerp(jarRef.current.rotation.x, targetRotX, 0.08);
        jarRef.current.rotation.z = THREE.MathUtils.lerp(jarRef.current.rotation.z, targetRotZ, 0.08);
      } else {
        jarRef.current.rotation.x = THREE.MathUtils.lerp(jarRef.current.rotation.x, 0, 0.04);
        jarRef.current.rotation.z = THREE.MathUtils.lerp(jarRef.current.rotation.z, 0, 0.04);
      }
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
    onHover?.(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover?.(false);
    document.body.style.cursor = 'auto';
  };

  // Dense fairy lights positions - many more lights filling the jar
  const fairyLights = useMemo(() => {
    const lights: { position: [number, number, number]; phase: number; intensity: number }[] = [];
    // Create dense clusters of lights
    for (let i = 0; i < 35; i++) {
      const t = i / 34;
      // Spiral pattern with randomization
      const angle = t * Math.PI * 6 + Math.random() * 0.8;
      const radius = 0.12 + Math.random() * 0.18;
      const y = -0.42 + t * 0.85;
      lights.push({
        position: [
          Math.cos(angle) * radius + (Math.random() - 0.5) * 0.08,
          y + (Math.random() - 0.5) * 0.06,
          Math.sin(angle) * radius + (Math.random() - 0.5) * 0.08
        ] as [number, number, number],
        phase: Math.random() * Math.PI * 2,
        intensity: 0.2 + Math.random() * 0.25
      });
    }
    return lights;
  }, []);

  return (
    <group 
      ref={jarRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Mason jar body - clear glass with slight blue tint like reference */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.38, 1.1, 32, 1, true]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          resolution={512}
          transmission={0.95}
          roughness={0.01}
          thickness={0.25}
          ior={1.5}
          chromaticAberration={0.015}
          anisotropy={0.02}
          distortion={0.02}
          distortionScale={0.05}
          temporalDistortion={0.02}
          clearcoat={1}
          attenuationDistance={0.6}
          attenuationColor="#E8F4FC"
          color={hovered ? "#FCFEFF" : "#F8FCFF"}
        />
      </mesh>

      {/* Jar bottom - thick glass */}
      <mesh position={[0, -0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 32]} />
        <MeshTransmissionMaterial
          samples={8}
          resolution={256}
          transmission={0.9}
          roughness={0.03}
          thickness={0.12}
          ior={1.5}
          clearcoat={1}
          color="#F8FCFF"
        />
      </mesh>

      {/* Wire bail clasp lid - glass top */}
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.4, 0.42, 0.08, 32]} />
        <MeshTransmissionMaterial
          samples={8}
          resolution={256}
          transmission={0.9}
          roughness={0.02}
          thickness={0.08}
          ior={1.5}
          clearcoat={1}
          color="#F8FCFF"
        />
      </mesh>

      {/* Metal rim around lid */}
      <mesh position={[0, 0.54, 0]}>
        <torusGeometry args={[0.41, 0.025, 8, 32]} />
        <meshStandardMaterial 
          color="#4A5568"
          roughness={0.35}
          metalness={0.85}
        />
      </mesh>

      {/* Wire bail clasp - left side */}
      <group position={[-0.38, 0.4, 0]}>
        <mesh rotation={[0, 0, Math.PI * 0.15]}>
          <torusGeometry args={[0.12, 0.012, 6, 12, Math.PI]} />
          <meshStandardMaterial color="#2D3748" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0.08, -0.08, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.15, 6]} />
          <meshStandardMaterial color="#2D3748" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      {/* Wire bail clasp - right side */}
      <group position={[0.38, 0.4, 0]}>
        <mesh rotation={[0, 0, -Math.PI * 0.15]}>
          <torusGeometry args={[0.12, 0.012, 6, 12, Math.PI]} />
          <meshStandardMaterial color="#2D3748" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[-0.08, -0.08, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.15, 6]} />
          <meshStandardMaterial color="#2D3748" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      {/* Top wire clasp handle */}
      <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.012, 6, 16, Math.PI]} />
        <meshStandardMaterial color="#2D3748" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Dense fairy light wires */}
      <LightWires />

      {/* Many fairy lights */}
      {fairyLights.map((light, i) => (
        <FairyLight key={i} position={light.position} phase={light.phase} intensity={light.intensity} />
      ))}

      {/* Strong inner ambient glow - warm amber */}
      <pointLight
        position={[0, -0.1, 0]}
        intensity={hovered ? 2.0 : 1.5}
        color="#FFAB00"
        distance={1.8}
        decay={2}
      />
      <pointLight
        position={[0, 0.2, 0]}
        intensity={hovered ? 1.0 : 0.7}
        color="#FFD54F"
        distance={1.2}
        decay={2}
      />
    </group>
  );
}

// Loader component
function Loader() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </Html>
  );
}

// Post-processing effects
function Effects({ isHovered }: { isHovered: boolean }) {
  return (
    <EffectComposer multisampling={4}>
      <Bloom 
        intensity={isHovered ? 0.6 : 0.4}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <DepthOfField
        focusDistance={0.02}
        focalLength={0.5}
        bokehScale={2}
      />
      <Vignette
        offset={0.3}
        darkness={0.25}
      />
    </EffectComposer>
  );
}

// Mobile fallback with animated image
function MobileFallback() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Bokeh overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle at 30% 20%, hsl(35 90% 70% / 0.3) 0%, transparent 30%), radial-gradient(circle at 70% 80%, hsl(35 90% 70% / 0.2) 0%, transparent 25%), radial-gradient(circle at 50% 50%, hsl(35 90% 70% / 0.15) 0%, transparent 40%)'
        }}
      />
      
      {/* Main jar image with parallax */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        animate={{
          scale: isHovered ? 1.02 : 1,
          y: isHovered ? -5 : 0,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <motion.img
          src={jarFallbackImage}
          alt="Cozy mason jar with fairy lights and gratitude notes"
          className="w-full h-full object-contain max-w-[500px]"
          style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))' }}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>

      {/* Animated glow pulse */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, hsl(35 90% 60% / 0.2) 0%, transparent 70%)'
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Film grain effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />
    </motion.div>
  );
}

interface PremiumJarSceneProps {
  className?: string;
}

export default function PremiumJarScene({ className = '' }: PremiumJarSceneProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

  // Show static fallback on mobile for performance
  if (isMobile) {
    return (
      <div 
        className={`relative ${className}`}
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, hsl(35 90% 93% / 0.7) 0%, transparent 70%)',
        }}
      >
        <MobileFallback />
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`}
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, hsl(35 90% 93% / 0.7) 0%, transparent 70%)',
      }}
    >
      {/* Soft halo glow behind jar */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          isHovered ? 'opacity-100' : 'opacity-70'
        }`}
        style={{
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, hsl(35 90% 70% / 0.25) 0%, transparent 60%)',
        }}
      />

      {/* Film grain overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-10"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />
      
      <Canvas
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={[1, 2]}
        camera={{ position: [0, 0.2, 3.2], fov: 42 }}
      >
        {/* Key light - soft area light from top-right */}
        <directionalLight 
          position={[3, 4, 2]} 
          intensity={0.8} 
          color="#FFF5E1"
          castShadow
        />
        
        {/* Rim light from back-left for depth */}
        <directionalLight 
          position={[-2, 2, -3]} 
          intensity={0.4} 
          color="#FDE68A"
        />
        
        {/* Ambient fill */}
        <ambientLight intensity={0.35} color="#FFF9F0" />
        
        <Suspense fallback={<Loader />}>
          <Float
            speed={1.5}
            rotationIntensity={0.08}
            floatIntensity={0.15}
          >
            <GlassJar onHover={setIsHovered} />
          </Float>
          
          {/* Contact shadow for grounding */}
          <ContactShadows
            position={[0, -0.85, 0]}
            opacity={0.35}
            scale={3}
            blur={2.5}
            far={1.5}
            color="#78350F"
          />
          
          <Environment preset="sunset" />
          <Effects isHovered={isHovered} />
        </Suspense>
      </Canvas>
    </div>
  );
}
