import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LuminousHopeOrbProps {
  size?: number;
  className?: string;
}

export default function LuminousHopeOrb({ size = 150, className = '' }: LuminousHopeOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current || rendererRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Sphere
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xF4A261),
      metalness: 0.9,
      roughness: 0.1,
      emissive: new THREE.Color(0xC45C3E),
      emissiveIntensity: 0.15,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xC4956A, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(0xF4A261, 2, 10);
    keyLight.position.set(2, 2, 2);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xE8644B, 1, 10);
    fillLight.position.set(-2, -1, 1);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xF4D0C4, 0.8);
    rimLight.position.set(0, 1, -2);
    scene.add(rimLight);

    // Orbiting inner light for the sweeping band effect
    const orbitLight = new THREE.PointLight(0xFFFBF5, 1.5, 5);
    scene.add(orbitLight);

    let time = 0;
    const animate = () => {
      time += 0.005;
      sphere.rotation.y += 0.003;
      sphere.rotation.x += 0.001;

      // Orbit the inner light to create sweeping highlight
      orbitLight.position.x = Math.cos(time) * 0.6;
      orbitLight.position.y = Math.sin(time * 0.7) * 0.4;
      orbitLight.position.z = Math.sin(time) * 0.6 + 0.3;

      renderer.render(scene, camera);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      rendererRef.current = null;
    };
  }, [size]);

  return (
    <div
      ref={containerRef}
      className={`inline-block ${className}`}
      style={{
        width: size,
        height: size,
        filter: 'drop-shadow(0 0 30px rgba(244, 162, 97, 0.3))',
      }}
    />
  );
}
