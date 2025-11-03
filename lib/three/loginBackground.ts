// lib/three/loginBackground.ts
// Reusable 3D background configuration for login page
import * as THREE from "three";

export interface ParticleConfig {
  count: number;
  size: { min: number; max: number };
  speed: { min: number; max: number };
  opacity: { min: number; max: number };
  color: {
    hueStart: number;
    hueEnd: number;
  };
}

export const DEFAULT_CONFIG: ParticleConfig = {
  count: 50,
  size: { min: 0.5, max: 2 },
  speed: { min: 0.01, max: 0.03 },
  opacity: { min: 0.2, max: 0.5 },
  color: {
    hueStart: 0.55, // Blue
    hueEnd: 0.7, // Purple
  },
};

/**
 * Create Merauke logo geometry (shield shape)
 */
export function createLogoGeometry(size: number): THREE.ShapeGeometry {
  const shape = new THREE.Shape();

  // Shield/emblem shape inspired by Indonesian regional emblems
  shape.moveTo(0, size);
  shape.lineTo(size * 0.7, size * 0.5);
  shape.lineTo(size * 0.7, -size * 0.3);
  shape.quadraticCurveTo(size * 0.7, -size, 0, -size);
  shape.quadraticCurveTo(-size * 0.7, -size, -size * 0.7, -size * 0.3);
  shape.lineTo(-size * 0.7, size * 0.5);
  shape.closePath();

  return new THREE.ShapeGeometry(shape);
}

/**
 * Alternative: Star shape (for Merauke's star symbolism)
 */
export function createStarGeometry(size: number): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  const spikes = 5;
  const outerRadius = size;
  const innerRadius = size * 0.4;

  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / spikes;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }

  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

/**
 * Create animated particle system
 */
export function createParticleSystem(
  scene: THREE.Scene,
  config: ParticleConfig = DEFAULT_CONFIG
): THREE.Mesh[] {
  const particles: THREE.Mesh[] = [];

  for (let i = 0; i < config.count; i++) {
    const size =
      Math.random() * (config.size.max - config.size.min) + config.size.min;

    // Alternate between shield and star shapes
    const geometry =
      i % 2 === 0 ? createLogoGeometry(size) : createStarGeometry(size);

    // Color gradient
    const hue =
      config.color.hueStart +
      Math.random() * (config.color.hueEnd - config.color.hueStart);
    const color = new THREE.Color().setHSL(hue, 0.7, 0.6);

    const opacity =
      Math.random() * (config.opacity.max - config.opacity.min) +
      config.opacity.min;

    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Random position in 3D space
    mesh.position.x = (Math.random() - 0.5) * 100;
    mesh.position.y = (Math.random() - 0.5) * 100;
    mesh.position.z = (Math.random() - 0.5) * 100;

    // Random rotation
    mesh.rotation.x = Math.random() * Math.PI * 2;
    mesh.rotation.y = Math.random() * Math.PI * 2;

    // Store velocity for animation
    const speedX =
      (Math.random() - 0.5) * (config.speed.max - config.speed.min) +
      config.speed.min;
    const speedY =
      (Math.random() - 0.5) * (config.speed.max - config.speed.min) +
      config.speed.min;
    const speedZ =
      (Math.random() - 0.5) * (config.speed.max - config.speed.min) +
      config.speed.min;

    (mesh as any).velocity = {
      x: speedX,
      y: speedY,
      z: speedZ,
      rotationX: (Math.random() - 0.5) * 0.01,
      rotationY: (Math.random() - 0.5) * 0.01,
    };

    scene.add(mesh);
    particles.push(mesh);
  }

  return particles;
}

/**
 * Create star field background
 */
export function createStarField(
  scene: THREE.Scene,
  count: number = 1000
): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({
    color: 0x88ccff,
    size: 0.5,
    transparent: true,
    opacity: 0.3,
  });

  const vertices = [];
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;
    vertices.push(x, y, z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  const starField = new THREE.Points(geometry, material);
  scene.add(starField);

  return starField;
}

/**
 * Animate particles
 */
export function animateParticles(
  particles: THREE.Mesh[],
  bounds: number = 50
): void {
  particles.forEach((particle) => {
    const velocity = (particle as any).velocity;

    // Update position
    particle.position.x += velocity.x;
    particle.position.y += velocity.y;
    particle.position.z += velocity.z;

    // Update rotation
    particle.rotation.x += velocity.rotationX;
    particle.rotation.y += velocity.rotationY;

    // Bounce back if out of bounds
    if (Math.abs(particle.position.x) > bounds) velocity.x *= -1;
    if (Math.abs(particle.position.y) > bounds) velocity.y *= -1;
    if (Math.abs(particle.position.z) > bounds) velocity.z *= -1;

    // Pulse opacity (breathing effect)
    const material = particle.material as THREE.MeshBasicMaterial;
    const time = Date.now() * 0.001;
    material.opacity = 0.2 + Math.sin(time + particle.position.x) * 0.15;
  });
}

/**
 * Cleanup Three.js resources
 */
export function cleanupScene(
  particles: THREE.Mesh[],
  starField: THREE.Points,
  renderer: THREE.WebGLRenderer
): void {
  particles.forEach((particle) => {
    particle.geometry.dispose();
    (particle.material as THREE.Material).dispose();
  });

  starField.geometry.dispose();
  (starField.material as THREE.Material).dispose();

  renderer.dispose();
}
