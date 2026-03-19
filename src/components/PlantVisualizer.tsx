import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface PlantVisualizerProps {
  stageIndex: number;
  progress: number; // 0 to 1
  isBurning?: boolean;
  hasPests?: boolean;
  weather?: 'sun' | 'rain';
}

const PlantVisualizer: React.FC<PlantVisualizerProps> = ({ 
  stageIndex, 
  progress,
  isBurning = false, 
  hasPests = false,
  weather = 'sun'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const plantGroupRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Use refs for props to avoid stale closures in the animation loop
  const isBurningRef = useRef(isBurning);
  const hasPestsRef = useRef(hasPests);
  const weatherRef = useRef(weather);
  const progressRef = useRef(progress);

  useEffect(() => {
    isBurningRef.current = isBurning;
  }, [isBurning]);

  useEffect(() => {
    hasPestsRef.current = hasPests;
  }, [hasPests]);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  useEffect(() => {
    progressRef.current = progress;
    if (plantGroupRef.current) {
      const scale = 1 + progress * 0.3; // Scale up to 30% within a stage
      plantGroupRef.current.scale.set(scale, scale, scale);
    }
  }, [progress]);

  const createPlantModel = (index: number) => {
    const group = new THREE.Group();
    
    // Stage 0: Seed
    if (index === 0) {
      const geometry = new THREE.SphereGeometry(0.3, 16, 16);
      const material = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
      const seed = new THREE.Mesh(geometry, material);
      seed.scale.y = 0.8;
      seed.position.y = 0.2;
      group.add(seed);
    }
    // Stage 1: Sprout
    else if (index === 1) {
      const stemGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x689F38 });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.y = 0.3;
      group.add(stem);

      const leafMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
      const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), leafMat);
      leaf1.scale.set(1, 0.2, 1);
      leaf1.position.set(0.15, 0.5, 0);
      leaf1.rotation.z = -0.4;
      
      const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), leafMat);
      leaf2.scale.set(1, 0.2, 1);
      leaf2.position.set(-0.15, 0.4, 0);
      leaf2.rotation.z = 0.4;
      
      group.add(leaf1, leaf2);
    }
    // Stage 2: Sapling
    else if (index === 2) {
      const trunkGeom = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x795548 });
      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.position.y = 0.6;
      group.add(trunk);

      const canopy = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x43A047 })
      );
      canopy.position.y = 1.3;
      group.add(canopy);
    }
    // Stage 3: Young Tree
    else if (index === 3) {
      const trunkGeom = new THREE.CylinderGeometry(0.15, 0.25, 1.8, 12);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.position.y = 0.9;
      group.add(trunk);

      const leafMat = new THREE.MeshStandardMaterial({ color: 0x2E7D32 });
      const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), leafMat);
      c1.position.set(0, 1.8, 0);
      const c2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), leafMat);
      c2.position.set(0.4, 1.5, 0.3);
      const c3 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), leafMat);
      c3.position.set(-0.4, 1.5, -0.3);
      group.add(c1, c2, c3);
    }
    // Stage 4: Mature Tree
    else {
      const trunkGeom = new THREE.CylinderGeometry(0.2, 0.4, 2.5, 16);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.position.y = 1.25;
      group.add(trunk);

      const leafMat = new THREE.MeshStandardMaterial({ color: 0x1B5E20 });
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), leafMat);
      canopy.position.y = 2.8;
      group.add(canopy);
    }

    return group;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Handle resize with ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0] || !rendererRef.current || !cameraRef.current) return;
      
      // Use clientWidth/Height for the most accurate "available space" measurement
      const width = containerRef.current?.clientWidth || 0;
      const height = containerRef.current?.clientHeight || 0;
      
      if (width === 0 || height === 0) return;

      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    });
    resizeObserver.observe(containerRef.current);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Ground
    const soilMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.5, 0.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 0.8 })
    );
    soilMesh.position.y = -0.1;
    scene.add(soilMesh);

    // Initial Plant
    const plantGroup = createPlantModel(stageIndex);
    scene.add(plantGroup);
    plantGroupRef.current = plantGroup;

    // Animation loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (plantGroupRef.current) {
        plantGroupRef.current.rotation.y += 0.015;
        
        // Visual effects based on state
        if (isBurningRef.current) {
          plantGroupRef.current.position.x = (Math.random() - 0.5) * 0.03;
          dirLightRef.current?.color.setHex(0xFF5252);
        } else if (hasPestsRef.current) {
          plantGroupRef.current.position.x = 0;
          dirLightRef.current?.color.setHex(0xB2FF59);
        } else {
          plantGroupRef.current.position.x = 0;
          dirLightRef.current?.color.setHex(weatherRef.current === 'sun' ? 0xFFFDE7 : 0xffffff);
        }
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update model when stage changes
  useEffect(() => {
    if (sceneRef.current && plantGroupRef.current) {
      sceneRef.current.remove(plantGroupRef.current);
      const newPlant = createPlantModel(stageIndex);
      sceneRef.current.add(newPlant);
      plantGroupRef.current = newPlant;
    }
  }, [stageIndex]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative z-10"
    />
  );
};

export default PlantVisualizer;
