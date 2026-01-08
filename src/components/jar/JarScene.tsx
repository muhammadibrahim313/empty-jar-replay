import { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  Float, 
  MeshTransmissionMaterial,
  useGLTF,
  PerspectiveCamera,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { Note } from '@/lib/types';

interface PaperSlipProps {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  isNew?: boolean;
  delay?: number;
}

function PaperSlip({ position, rotation, color, isNew = false, delay = 0 }: PaperSlipProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [animationProgress, setAnimationProgress] = useState(isNew ? 0 : 1);

  useFrame((_, delta) => {
    if (isNew && animationProgress < 1) {
      setAnimationProgress(prev => Math.min(prev + delta * 2, 1));
    }
  });

  const animatedPosition = useMemo(() => {
    if (!isNew || animationProgress >= 1) return position;
    const startY = position[1] + 2;
    const currentY = startY + (position[1] - startY) * animationProgress;
    return [position[0], currentY, position[2]] as [number, number, number];
  }, [position, isNew, animationProgress]);

  const animatedRotation = useMemo(() => {
    if (!isNew || animationProgress >= 1) return rotation;
    const startRot = [rotation[0] + Math.PI * 0.5, rotation[1] - Math.PI * 0.3, rotation[2]];
    return [
      startRot[0] + (rotation[0] - startRot[0]) * animationProgress,
      startRot[1] + (rotation[1] - startRot[1]) * animationProgress,
      rotation[2],
    ] as [number, number, number];
  }, [rotation, isNew, animationProgress]);

  const opacity = isNew ? animationProgress : 1;

  return (
    <mesh
      ref={meshRef}
      position={animatedPosition}
      rotation={animatedRotation}
      scale={isNew ? [animationProgress * 0.8 + 0.2, animationProgress * 0.8 + 0.2, 1] : 1}
    >
      <boxGeometry args={[0.3, 0.15, 0.02]} />
      <meshStandardMaterial 
        color={color}
        roughness={0.8}
        metalness={0}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

interface GlassJarProps {
  notes: Note[];
  newNoteId?: string | null;
  onHover?: (hovered: boolean) => void;
}

function GlassJar({ notes, newNoteId, onHover }: GlassJarProps) {
  const jarRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { viewport } = useThree();

  useFrame((state) => {
    if (jarRef.current) {
      // Gentle rotation
      jarRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      
      // Parallax on hover
      if (hovered) {
        const targetRotX = (state.mouse.y * 0.1);
        const targetRotZ = (state.mouse.x * -0.05);
        jarRef.current.rotation.x = THREE.MathUtils.lerp(jarRef.current.rotation.x, targetRotX, 0.1);
        jarRef.current.rotation.z = THREE.MathUtils.lerp(jarRef.current.rotation.z, targetRotZ, 0.1);
      } else {
        jarRef.current.rotation.x = THREE.MathUtils.lerp(jarRef.current.rotation.x, 0, 0.05);
        jarRef.current.rotation.z = THREE.MathUtils.lerp(jarRef.current.rotation.z, 0, 0.05);
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

  // Generate paper slip positions based on notes
  const paperSlips = useMemo(() => {
    const colors = [
      '#FEF3C7', // Warm cream
      '#ECFDF5', // Mint
      '#FEE2E2', // Blush
      '#EDE9FE', // Lavender
      '#FEF9C3', // Lemon
    ];

    return notes.map((note, i) => ({
      id: note.id,
      position: [
        (Math.random() - 0.5) * 0.4,
        -0.3 + (i * 0.08) + Math.random() * 0.1,
        (Math.random() - 0.5) * 0.3,
      ] as [number, number, number],
      rotation: [
        (Math.random() - 0.5) * 0.3,
        Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.5,
      ] as [number, number, number],
      color: colors[i % colors.length],
      isNew: note.id === newNoteId,
    }));
  }, [notes, newNoteId]);

  return (
    <Float
      speed={2}
      rotationIntensity={0.2}
      floatIntensity={0.3}
    >
      <group 
        ref={jarRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* Main jar body - glass */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.55, 1.4, 32, 1, true]} />
          <MeshTransmissionMaterial
            backside
            samples={16}
            resolution={512}
            transmission={0.95}
            roughness={0.05}
            thickness={0.2}
            ior={1.5}
            chromaticAberration={0.03}
            anisotropy={0.1}
            distortion={0.1}
            distortionScale={0.2}
            temporalDistortion={0.1}
            clearcoat={1}
            attenuationDistance={0.5}
            attenuationColor="#FFF9E6"
            color={hovered ? "#FFFCF0" : "#FFF9E6"}
          />
        </mesh>

        {/* Jar bottom */}
        <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.55, 32]} />
          <MeshTransmissionMaterial
            samples={8}
            resolution={256}
            transmission={0.9}
            roughness={0.1}
            thickness={0.1}
            ior={1.5}
            clearcoat={1}
            color="#FFF9E6"
          />
        </mesh>

        {/* Cork lid */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.5, 0.55, 0.25, 32]} />
          <meshStandardMaterial 
            color="#C4A574"
            roughness={0.9}
            metalness={0}
          />
        </mesh>

        {/* Cork texture ring */}
        <mesh position={[0, 0.75, 0]}>
          <torusGeometry args={[0.52, 0.03, 8, 32]} />
          <meshStandardMaterial 
            color="#B8956A"
            roughness={1}
            metalness={0}
          />
        </mesh>

        {/* Inner glow */}
        <pointLight
          position={[0, -0.2, 0]}
          intensity={hovered ? 0.8 : 0.4}
          color="#FBBF24"
          distance={2}
        />

        {/* Paper slips inside */}
        {paperSlips.map((slip) => (
          <PaperSlip
            key={slip.id}
            position={slip.position}
            rotation={slip.rotation}
            color={slip.color}
            isNew={slip.isNew}
          />
        ))}
      </group>
    </Float>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </Html>
  );
}

interface JarSceneProps {
  notes: Note[];
  newNoteId?: string | null;
  className?: string;
  size?: 'hero' | 'panel';
}

export default function JarScene({ notes, newNoteId, className = '', size = 'panel' }: JarSceneProps) {
  const [isHovered, setIsHovered] = useState(false);

  const cameraPosition = size === 'hero' ? [0, 0.5, 4] : [0, 0.3, 3.5];

  return (
    <div 
      className={`relative ${className}`}
      style={{
        background: 'radial-gradient(ellipse at center, hsl(35 90% 95% / 0.5) 0%, transparent 70%)',
      }}
    >
      {/* Glow effect */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
          isHovered ? 'opacity-100' : 'opacity-60'
        }`}
        style={{
          background: 'radial-gradient(ellipse at center, hsl(35 90% 70% / 0.15) 0%, transparent 60%)',
        }}
      />
      
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera 
          makeDefault 
          position={cameraPosition as [number, number, number]}
          fov={45}
        />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} color="#FDE68A" />
        
        <Suspense fallback={<Loader />}>
          <GlassJar 
            notes={notes} 
            newNoteId={newNoteId}
            onHover={setIsHovered}
          />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}
