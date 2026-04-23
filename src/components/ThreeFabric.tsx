import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ThreeFabric() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 24;
    camera.position.y = 0;
    camera.position.x = 0;
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Geometry - Reduced resolution for massive performance gain on mobile while maintaining smooth curves
    const geometry = new THREE.PlaneGeometry(16, 28, 48, 64);

    // Initial positions for vertex calculations
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    const initialZ: number[] = [];
    const initialX: number[] = [];
    
    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        initialZ.push(vertex.z);
        initialX.push(vertex.x);
    }

    // Material - Dark Silk with rich specular highlights
    const material = new THREE.MeshStandardMaterial({
      color: 0x080808, // deep obsidian
      roughness: 0.25,
      metalness: 0.75, 
      side: THREE.DoubleSide,
      wireframe: false,
    });

    const plane = new THREE.Mesh(geometry, material);
    // Orient vertically but with a slight sophisticated angle
    plane.rotation.x = -0.05; 
    plane.rotation.y = 0.15; 
    scene.add(plane);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    scene.add(ambientLight);

    const goldLight = new THREE.DirectionalLight(0xd4af37, 2.5); // striking gold light
    goldLight.position.set(10, 15, 10);
    scene.add(goldLight);
    
    const crimsonLight = new THREE.DirectionalLight(0x8a0303, 1.2); // deep red fill to hint luxury
    crimsonLight.position.set(-10, -5, 5);
    scene.add(crimsonLight);

    const rimLight = new THREE.PointLight(0xffffff, 1.5, 50);
    rimLight.position.set(0, 5, 8);
    scene.add(rimLight);

    // GSAP Scroll tracking for Unfolding Effect
    const scrollData = { progress: 0 };
    
    // We bind the scroll trigger precisely to the parent hero wrap
    const st = ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: () => `+=${window.innerHeight * 1.5}`, // Over the first 1.5 screens
        scrub: 2.5, // Increased significantly for buttery smooth interpolation
        onUpdate: (self) => {
            scrollData.progress = self.progress;
        }
    });

    // Animation loop
    let frameId: number;
    let scrollY = 0;
    const clock = new THREE.Clock();
    let isVisible = true;

    const handleScroll = () => {
        scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Intersection Observer to pause heavy WebGL calculations when scrolled past
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
        });
    }, { rootMargin: "0px 0px 200px 0px" });
    
    if (mountRef.current) {
        observer.observe(mountRef.current);
    }

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isVisible) return; // Skip CPU intensive calculations when off-screen

      const elapsedTime = clock.getElapsedTime() * 0.4;
      const scrollProgress = scrollData.progress;

      // Unfolding and Draping Vertex Logic
      for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        
        // Y goes from approx -14 to +14 in local space
        const yNormalized = (vertex.y + 14) / 28; // 0 at bottom, 1 at top
        
        // Folds are tightly gathered at the top (pinned), billing out at the bottom
        const depthMultiplier = Math.pow(1.0 - yNormalized, 1.5); 
        
        // Core structural folds of the drape
        const foldBase = Math.sin(initialX[i] * 0.6 + elapsedTime * 0.4) * 2.0;
        const foldDetail = Math.cos(initialX[i] * 1.5 - elapsedTime * 0.5) * 1.0;
        
        // A gentle, vertical cascading wave ("breathing saree")
        const wind = Math.sin(vertex.y * 0.25 + elapsedTime * 1.2) * (1.2 * depthMultiplier);

        // The Unfolding logic -> The scroll expands the width and reduces the tight gathering
        // It starts tightly wrapped on the X axis, and as you scroll, it flares out
        const unfurlFactor = 1.0 + (scrollProgress * 2.5); 
        const twistFactor = (1.0 - scrollProgress); // slowly untwists as you scroll down
        
        // Apply twist to Z
        const twistZ = initialX[i] * twistFactor * 0.5;

        const zPos = initialZ[i] + (foldBase + foldDetail) * (0.2 + depthMultiplier) + wind + twistZ;
        
        // Squeeze top width slightly to simulate gathering/pinning at the shoulder, but unfurl it overall
        const gather = (1.0 - depthMultiplier) * 0.8 * twistFactor; 
        const xPos = initialX[i] * (1.0 - gather) * unfurlFactor;

        positionAttribute.setXYZ(i, xPos, vertex.y, zPos);
      }

      positionAttribute.needsUpdate = true;
      geometry.computeVertexNormals();

      // Gentle continuous rotation while responding to scroll depth
      plane.rotation.y = 0.15 + Math.sin(elapsedTime * 0.3) * 0.1 - (scrollY * 0.0005);
      
      // Camera sinks and pulls back slightly to fit the wider unfurled fabric
      camera.position.y = (scrollY * -0.012); 
      camera.position.z = 24 + (scrollData.progress * 8);

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      st.kill();
      if (mountRef.current) observer.unobserve(mountRef.current);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 -z-10 pointer-events-none overflow-hidden flex items-center justify-center opacity-80" style={{ willChange: 'transform' }} />;
}
