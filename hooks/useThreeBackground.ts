// hooks/useThreeBackground.ts
// THEME-AWARE VERSION with Dark/Light mode support

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface ThreeBackgroundConfig {
  particleCount?: number;
  particleColor?: string;
  particleSize?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  backgroundColor?: string;
  gradientColors?: string[];
  enableWaves?: boolean;
  enableRotation?: boolean;
}

export interface ThreeBackgroundOptions {
  config?: ThreeBackgroundConfig;
  enableStarField?: boolean;
  cameraAnimation?: boolean;
  enableFloatingLogos?: boolean;
  logoImage?: string;
  logoCount?: number;
  logoSize?: number;
  theme?: "light" | "dark"; // ← NEW: Theme support
}

// ===== THEME CONFIGS =====
export const PRESET_CONFIGS = {
  merauke: {
    dark: {
      particleCount: 2000,
      particleColor: "#60a5fa",
      particleSize: 2,
      waveSpeed: 0.001,
      waveAmplitude: 0.5,
      backgroundColor: "#0a1628",
      gradientColors: ["#0a1628", "#1e3a5f", "#2d1b69"],
      enableWaves: true,
      enableRotation: true,
    },
    light: {
      particleCount: 1500,
      particleColor: "#3b82f6",
      particleSize: 1.5,
      waveSpeed: 0.0008,
      waveAmplitude: 0.3,
      backgroundColor: "#e0f2fe",
      gradientColors: ["#e0f2fe", "#bae6fd", "#7dd3fc"],
      enableWaves: true,
      enableRotation: true,
    },
  },
  ocean: {
    dark: {
      particleCount: 1500,
      particleColor: "#3b82f6",
      particleSize: 3,
      waveSpeed: 0.002,
      waveAmplitude: 0.8,
      backgroundColor: "#1e3a8a",
      gradientColors: ["#1e3a8a", "#3b82f6"],
      enableWaves: true,
      enableRotation: false,
    },
    light: {
      particleCount: 1200,
      particleColor: "#0ea5e9",
      particleSize: 2,
      waveSpeed: 0.0015,
      waveAmplitude: 0.5,
      backgroundColor: "#f0f9ff",
      gradientColors: ["#f0f9ff", "#e0f2fe"],
      enableWaves: true,
      enableRotation: false,
    },
  },
  space: {
    dark: {
      particleCount: 3000,
      particleColor: "#ffffff",
      particleSize: 1.5,
      waveSpeed: 0.0005,
      waveAmplitude: 0.3,
      backgroundColor: "#000000",
      gradientColors: ["#000000", "#1a1a2e"],
      enableWaves: false,
      enableRotation: true,
    },
    light: {
      particleCount: 2000,
      particleColor: "#60a5fa",
      particleSize: 1,
      waveSpeed: 0.0003,
      waveAmplitude: 0.2,
      backgroundColor: "#fafafa",
      gradientColors: ["#fafafa", "#f5f5f5"],
      enableWaves: false,
      enableRotation: true,
    },
  },
};

export function useThreeBackground(options: ThreeBackgroundOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const materialsRef = useRef<THREE.Material[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Get theme-specific config
    const theme = options.theme || "dark";
    const baseConfig = options.config || PRESET_CONFIGS.merauke[theme];
    const config = { ...baseConfig };

    console.log("🎨 Three.js Background Theme:", theme);

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Particles (stars)
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = config.particleCount || 2000;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 200;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: config.particleSize || 2,
      color: config.particleColor || "#60a5fa",
      transparent: true,
      opacity: theme === "light" ? 0.5 : 0.8,
      blending: THREE.AdditiveBlending,
    });

    materialsRef.current.push(particlesMaterial);

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    // Floating Logos
    const logoData: Array<{
      mesh: THREE.Sprite;
      velocity: THREE.Vector3;
      rotationSpeed: THREE.Vector3;
    }> = [];

    if (options.enableFloatingLogos && options.logoImage) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        options.logoImage,
        (texture) => {
          const logoCount = options.logoCount || 15;
          const logoSize = options.logoSize || 8;

          for (let i = 0; i < logoCount; i++) {
            const material = new THREE.SpriteMaterial({
              map: texture,
              transparent: true,
              opacity:
                theme === "light"
                  ? 0.3 + Math.random() * 0.2 // More subtle in light mode
                  : 0.5 + Math.random() * 0.3,
              blending:
                theme === "light"
                  ? THREE.NormalBlending
                  : THREE.AdditiveBlending,
            });

            materialsRef.current.push(material);

            const sprite = new THREE.Sprite(material);

            const size = logoSize * (0.5 + Math.random() * 1);
            sprite.scale.set(size, size, 1);

            sprite.position.set(
              (Math.random() - 0.5) * 150,
              (Math.random() - 0.5) * 150,
              (Math.random() - 0.5) * 100
            );

            scene.add(sprite);

            logoData.push({
              mesh: sprite,
              velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.05,
                (Math.random() - 0.5) * 0.05,
                (Math.random() - 0.5) * 0.05
              ),
              rotationSpeed: new THREE.Vector3(
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01
              ),
            });
          }

          console.log(`✅ ${logoCount} floating logos added (${theme} theme)`);
        },
        undefined,
        (error) => {
          console.error("❌ Error loading logo texture:", error);
        }
      );
    }

    // Lighting - adjust for theme
    const ambientLight = new THREE.AmbientLight(
      theme === "light" ? 0xffffff : 0x404040,
      theme === "light" ? 0.8 : 0.5
    );
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(
      theme === "light" ? 0x3b82f6 : 0x60a5fa,
      theme === "light" ? 0.5 : 1,
      100
    );
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Animation
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      time += 0.001;

      // Animate particles
      if (config.enableWaves) {
        const positions = particlesGeometry.attributes.position
          .array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const z = positions[i + 2];
          positions[i + 1] =
            Math.sin(x * 0.1 + time * 10) * (config.waveAmplitude || 0.5) +
            Math.cos(z * 0.1 + time * 10) * (config.waveAmplitude || 0.5);
        }
        particlesGeometry.attributes.position.needsUpdate = true;
      }

      if (config.enableRotation) {
        particlesMesh.rotation.y += config.waveSpeed || 0.001;
      }

      // Animate camera
      if (options.cameraAnimation) {
        camera.position.x = Math.sin(time * 0.5) * 5;
        camera.position.y = Math.cos(time * 0.3) * 3;
        camera.lookAt(0, 0, 0);
      }

      // Animate Floating Logos
      logoData.forEach((logoItem) => {
        const { mesh, velocity } = logoItem;

        mesh.position.add(velocity);

        const bounds = 75;
        if (Math.abs(mesh.position.x) > bounds) {
          velocity.x *= -1;
        }
        if (Math.abs(mesh.position.y) > bounds) {
          velocity.y *= -1;
        }
        if (Math.abs(mesh.position.z) > bounds) {
          velocity.z *= -1;
        }

        mesh.position.y += Math.sin(time * 2 + mesh.position.x) * 0.02;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      // Dispose materials
      materialsRef.current.forEach((material) => {
        material.dispose();
      });

      particlesGeometry.dispose();
      renderer.dispose();
    };
  }, [options.theme, options]); // Re-run when theme changes

  return canvasRef;
}
