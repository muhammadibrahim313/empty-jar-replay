import { Suspense, useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  Float, 
  MeshTransmissionMaterial,
  PerspectiveCamera,
  Html,
  ContactShadows
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import jarFallbackImage from '@/assets/jar-hero-fallback.jpg';

// Fairy light component with twinkling
function FairyLight({ position, phase }: { position: [number, number, number]; phase: number }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    // Slow twinkle with random phase
    const intensity = 0.3 + Math.sin(time * 0.8 + phase) * 0.15 + Math.sin(time * 1.3 + phase * 2) * 0.1;
    const scale = 0.8 + Math.sin(time * 0.8 + phase) * 0.2;
    
    if (lightRef.current) {
      lightRef.current.intensity = intensity;
    }
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#FBBF24" transparent opacity={0.9} />
      </mesh>
      <pointLight
        ref={lightRef}
        color="#F59E0B"
        intensity={0.3}
        distance={0.8}
        decay={2}
      />
    </group>
  );
}

// Wire string for fairy lights
function LightWire() {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 20; i++) {
      const t = i / 19;
      const angle = t * Math.PI * 3;
      const radius = 0.25 + Math.sin(t * Math.PI) * 0.1;
      const y = -0.4 + t * 0.7;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      ));
    }
    return pts;
  }, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  return (
    <mesh>
      <tubeGeometry args={[curve, 64, 0.004, 4, false]} />
      <meshBasicMaterial color="#92400E" transparent opacity={0.6} />
    </mesh>
  );
}

// Folded paper note inside the jar
interface PaperNoteProps {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  scale?: number;
}

function PaperNote({ position, rotation, color, scale = 1 }: PaperNoteProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating movement
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0] * 10) * 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[0.18, 0.1, 0.015]} />
      <meshStandardMaterial 
        color={color}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
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

  // Fairy lights positions with random phases
  const fairyLights = useMemo(() => {
    const lights: { position: [number, number, number]; phase: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const angle = t * Math.PI * 3 + Math.random() * 0.5;
      const radius = 0.22 + Math.random() * 0.1;
      const y = -0.35 + t * 0.65;
      lights.push({
        position: [
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ] as [number, number, number],
        phase: Math.random() * Math.PI * 2
      });
    }
    return lights;
  }, []);

  // Paper notes
  const paperNotes = useMemo(() => {
    const colors = ['#FEF3C7', '#ECFDF5', '#FEE2E2', '#EDE9FE', '#FEF9C3', '#DBEAFE'];
    return [
      { position: [-0.1, -0.32, 0.05] as [number, number, number], rotation: [0.1, 0.8, 0.2] as [number, number, number], color: colors[0] },
      { position: [0.08, -0.28, -0.08] as [number, number, number], rotation: [-0.1, -0.5, 0.1] as [number, number, number], color: colors[1] },
      { position: [0.02, -0.22, 0.12] as [number, number, number], rotation: [0.2, 1.2, -0.1] as [number, number, number], color: colors[2] },
      { position: [-0.12, -0.15, -0.05] as [number, number, number], rotation: [-0.15, 2.1, 0.15] as [number, number, number], color: colors[3] },
      { position: [0.1, -0.08, 0.02] as [number, number, number], rotation: [0.1, -0.3, -0.2] as [number, number, number], color: colors[4] },
      { position: [-0.05, 0.0, 0.08] as [number, number, number], rotation: [0.05, 0.6, 0.1] as [number, number, number], color: colors[5] },
    ];
  }, []);

  return (
    <group 
      ref={jarRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Mason jar body - realistic glass with thickness */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.45, 1.2, 32, 1, true]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          resolution={512}
          transmission={0.92}
          roughness={0.02}
          thickness={0.35}
          ior={1.52}
          chromaticAberration={0.02}
          anisotropy={0.05}
          distortion={0.05}
          distortionScale={0.1}
          temporalDistortion={0.05}
          clearcoat={1}
          attenuationDistance={0.4}
          attenuationColor="#FFF5E1"
          color={hovered ? "#FFFCF5" : "#FFF8ED"}
        />
      </mesh>

      {/* Jar bottom - thick glass */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 32]} />
        <MeshTransmissionMaterial
          samples={8}
          resolution={256}
          transmission={0.85}
          roughness={0.05}
          thickness={0.15}
          ior={1.52}
          clearcoat={1}
          color="#FFF8ED"
        />
      </mesh>

      {/* Mason jar threading rim */}
      <mesh position={[0, 0.6, 0]}>
        <torusGeometry args={[0.48, 0.04, 8, 32]} />
        <meshStandardMaterial 
          color="#E5E7EB"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.47, 0.025, 6, 32]} />
        <meshStandardMaterial 
          color="#D1D5DB"
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Cork lid */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.42, 0.46, 0.22, 32]} />
        <meshStandardMaterial 
          color="#C4A574"
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      
      {/* Cork texture details */}
      <mesh position={[0, 0.83, 0]}>
        <cylinderGeometry args={[0.38, 0.42, 0.02, 32]} />
        <meshStandardMaterial 
          color="#B8956A"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Fairy light wire */}
      <LightWire />

      {/* Fairy lights */}
      {fairyLights.map((light, i) => (
        <FairyLight key={i} position={light.position} phase={light.phase} />
      ))}

      {/* Paper notes */}
      {paperNotes.map((note, i) => (
        <PaperNote
          key={i}
          position={note.position}
          rotation={note.rotation}
          color={note.color}
          scale={0.9 + Math.random() * 0.2}
        />
      ))}

      {/* Inner ambient glow */}
      <pointLight
        position={[0, -0.1, 0]}
        intensity={hovered ? 1.2 : 0.8}
        color="#F59E0B"
        distance={1.5}
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
