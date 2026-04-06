import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text3D, Center, Environment, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FinancialLogo() {
  const coinRef = useRef<THREE.Group>(null);
  
  // Font URL for 3D Text
  const fontUrl = "/helvetiker_bold.json";

  useFrame((state) => {
    if (coinRef.current) {
      // Primary rotation
      coinRef.current.rotation.y += 0.015;
      // Subtle tilt
      coinRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
    }
  });

  return (
    <group ref={coinRef}>
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1}>
        {/* The Coin Body */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1, 1, 0.2, 32]} />
          <meshStandardMaterial 
            color="#FFD700" 
            metalness={1} 
            roughness={0.15} 
            emissive="#B8860B"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* The Dollar Sign ($) - Front */}
        <Center position={[0, 0, 0.11]}>
          <Text3D
            font={fontUrl}
            size={0.65}
            height={0.1}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            $
            <meshStandardMaterial 
              color="#FFFFFF" 
              metalness={0.9} 
              roughness={0.1} 
              emissive="#FFD700"
              emissiveIntensity={0.1}
            />
          </Text3D>
        </Center>

        {/* The Dollar Sign ($) - Back */}
        <Center position={[0, 0, -0.11]} rotation={[0, Math.PI, 0]}>
          <Text3D
            font={fontUrl}
            size={0.65}
            height={0.1}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            $
            <meshStandardMaterial 
              color="#FFFFFF" 
              metalness={0.9} 
              roughness={0.1} 
              emissive="#FFD700"
              emissiveIntensity={0.1}
            />
          </Text3D>
        </Center>
      </Float>

      {/* Lighting for the "Gold" pop */}
      <ambientLight intensity={0.6} />
      <spotLight position={[5, 10, 5]} angle={0.15} penumbra={1} intensity={2} color="#FFFFFF" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#FFD700" />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#FFFFFF" />
      
      {/* Environment for reflections */}
      <Environment files="/potsdamer_platz_1k.hdr" />
    </group>
  );
}

export function ThreeLogo({ className }: { className?: string }) {
  return (
    <div className={`w-16 h-16 ${className || ''} relative group cursor-pointer`}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <FinancialLogo />
      </Canvas>
      {/* Subtle glow behind the logo */}
      <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 blur-2xl rounded-full -z-10 group-hover:bg-blue-500/20 transition-all" />
    </div>
  );
}
