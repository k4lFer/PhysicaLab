import { useRef } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Charge } from '@/domain/entities/Charge';
import { COULOMB_K } from '@/shared/constants';
import { usePhysicsTheme } from '@/presentation/hooks/usePhysicsTheme';

interface Graph3DProps {
  charges: Charge[];
  targetId: number;
  netForce: { x: number; y: number; z: number };
  sources: Charge[];
}

function toCm(v: number) { return v * 100; }

export function Graph3D({ charges, targetId, netForce, sources }: Graph3DProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.wrapper}>
      <Canvas
        camera={{ position: [8, 6, 8], fov: 45 }}
        style={{ background: isDark ? '#000' : '#fff', width: '100%', height: 390 }}
        gl={{ antialias: true }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={0.6} />
        <pointLight position={[-5, -5, -5]} intensity={0.3} />
        <Scene3D charges={charges} targetId={targetId} netForce={netForce} sources={sources} />
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </View>
  );
}

function Scene3D({ charges, targetId, netForce, sources }: Graph3DProps) {
  const target = charges.find(c => c.id === targetId);
  if (!target) return null;

  const isDark = useColorScheme() === 'dark';
  const theme = usePhysicsTheme();

  const maxF = Math.max(
    ...sources.map(s => {
      const dx = target.x - s.x;
      const dy = target.y - s.y;
      const dz = target.z - s.z;
      const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
      return r === 0 ? 0 : COULOMB_K * Math.abs(s.q * target.q) / (r * r);
    }),
    1e-15,
  );

  const arrowScale = 2 / maxF;

  return (
    <group>
      <gridHelper args={[16, 12, theme.border, theme.border]} position={[0, -0.5, 0]} />
      <axesHelper args={[7]} />

      {sources.map(s => {
        const dx = target.x - s.x;
        const dy = target.y - s.y;
        const dz = target.z - s.z;
        const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (r === 0) return null;
        const Fm = COULOMB_K * Math.abs(s.q * target.q) / (r * r);
        const sg = s.q * target.q > 0 ? 1 : -1;
        return (
          <Arrow3D
            key={s.id}
            from={[toCm(target.x), toCm(target.y), toCm(target.z)]}
            to={[
              toCm(target.x) + sg * Fm * (dx / r) * arrowScale,
              toCm(target.y) + sg * Fm * (dy / r) * arrowScale,
              toCm(target.z) + sg * Fm * (dz / r) * arrowScale,
            ]}
            color={theme.componentColor}
          />
        );
      })}

      <Arrow3D
        from={[toCm(target.x), toCm(target.y), toCm(target.z)]}
        to={[
          toCm(target.x) + netForce.x * arrowScale,
          toCm(target.y) + netForce.y * arrowScale,
          toCm(target.z) + netForce.z * arrowScale,
        ]}
        color={theme.netForce}
      />

      {charges.map(c => {
        const isT = c.id === targetId;
        const color = c.q >= 0 ? theme.positive : theme.negative;
        const pos: [number, number, number] = [toCm(c.x), toCm(c.y), toCm(c.z)];
        return (
          <group key={c.id}>
            <mesh position={pos}>
              <sphereGeometry args={[isT ? 0.4 : 0.3, 24, 24]} />
              <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
            </mesh>
            {isT && (
              <mesh position={pos}>
                <sphereGeometry args={[0.55, 24, 24]} />
                <meshBasicMaterial color={theme.accent} wireframe transparent opacity={0.3} />
              </mesh>
            )}
            <TextSprite position={[pos[0], pos[1] + 0.7, pos[2]]} text={c.label} />
          </group>
        );
      })}
    </group>
  );
}

function TextSprite({ position, text }: { position: [number, number, number]; text: string }) {
  const ref = useRef<THREE.Sprite>(null);
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 48;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 48);
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, 64, 24);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });

  return <sprite ref={ref} position={position} material={material} scale={[1.2, 0.5, 1]} />;
}

interface Arrow3DProps {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
}

function Arrow3D({ from, to, color }: Arrow3DProps) {
  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const length = dir.length();
  if (length < 0.01) return null;

  return (
    <group position={from}>
      <arrowHelper args={[dir.clone().normalize(), new THREE.Vector3(0, 0, 0), length, color, 0.4, 0.2]} />
    </group>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 390,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
