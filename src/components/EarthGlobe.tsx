import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CountryProfile } from "../types";

interface EarthGlobeProps {
  onSelectCountry: (profile: any) => void;
  selectedCountryCode: string | null;
  selectedCountryName: string | null;
}

// Interactive earth country coordinates registry
export const COUNTRIES_DATABASE = [
  { name: "United States", code: "US", lat: 37.09, lng: -95.71, color: "#06b6d4" },
  { name: "Japan", code: "JP", lat: 36.20, lng: 138.25, color: "#09f1b8" },
  { name: "Germany", code: "DE", lat: 51.16, lng: 10.45, color: "#f43f5e" },
  { name: "Brazil", code: "BR", lat: -14.23, lng: -51.92, color: "#3b82f6" },
  { name: "Australia", code: "AU", lat: -25.27, lng: 133.77, color: "#10b981" },
  { name: "United Kingdom", code: "GB", lat: 55.37, lng: -3.43, color: "#a855f7" },
  { name: "India", code: "IN", lat: 20.59, lng: 78.96, color: "#eab308" },
  { name: "Canada", code: "CA", lat: 56.13, lng: -106.34, color: "#ec4899" }
];

export const EarthGlobe: React.FC<EarthGlobeProps> = ({
  onSelectCountry,
  selectedCountryCode,
  selectedCountryName
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [loadingCountry, setLoadingCountry] = useState<string | null>(null);

  // Keep references to guide interactions safely
  const globeRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const beaconRef = useRef<THREE.Mesh | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  // Mouse rotation control state
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0.2, y: 0 }); // Initial tilt
  const currentRotation = useRef({ x: 0.2, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 550;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7.5;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 4. Stars Starfield Background
    const starsCount = 400;
    const starsGeometry = new THREE.BufferGeometry();
    const starsPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      // Scatter in a ball surrounding the globe
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 20 + Math.random() * 30; // Radius far out

      starsPositions[i] = r * Math.sin(phi) * Math.sin(theta);
      starsPositions[i + 1] = r * Math.cos(phi);
      starsPositions[i + 2] = r * Math.sin(phi) * Math.cos(theta);

      // Random color temperatures (cyan, white, deep blue)
      const colorType = Math.random();
      if (colorType > 0.8) {
        // Cyan
        starColors[i] = 0.2;
        starColors[i + 1] = 0.7;
        starColors[i + 2] = 1.0;
      } else if (colorType > 0.6) {
        // Soft amber
        starColors[i] = 1.0;
        starColors[i + 1] = 0.8;
        starColors[i + 2] = 0.4;
      } else {
        // White
        starColors[i] = 1.0;
        starColors[i + 1] = 1.0;
        starColors[i + 2] = 1.0;
      }
    }

    starsGeometry.setAttribute("position", new THREE.BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    // Custom star material
    const starTexture = createCircleTexture("#ffffff");
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // 5. Create the 3D Globe Group
    const globeGroup = new THREE.Group();
    globeRef.current = globeGroup;
    scene.add(globeGroup);

    // 6. Generate procedural high-tech Earth Texture via a dynamic 2D canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Fill oceanic grid (deep space blueprint look)
      ctx.fillStyle = "#0c1020"; // Dark navy ocean
      ctx.fillRect(0, 0, 1024, 512);

      // Draw horizontal & vertical latitude/longitude lines
      ctx.strokeStyle = "rgba(6, 182, 212, 0.12)"; // Very quiet cyan lines
      ctx.lineWidth = 1;
      const step = 32;

      for (let x = 0; x < 1024; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y < 512; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }

      // Draw stylized glowing procedural continents
      // (North America, South America, Eurasia, Africa, Australia, Antarctica, Greenland)
      ctx.fillStyle = "#1e293b"; // Dark slate continent body
      ctx.strokeStyle = "#0891b2"; // Glowing cyan borders
      ctx.lineWidth = 2.5;

      const drawContinent = (coords: [number, number][]) => {
        if (coords.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(coords[0][0], coords[0][1]);
        for (let i = 1; i < coords.length; i++) {
          ctx.lineTo(coords[i][0], coords[i][1]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Fill continent with custom blueprint dots matrix
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(coords[0][0], coords[0][1]);
        for (let i = 1; i < coords.length; i++) {
          ctx.lineTo(coords[i][0], coords[i][1]);
        }
        ctx.closePath();
        ctx.clip();

        // Draw tech-dot grid inside landmass
        ctx.fillStyle = "rgba(16, 185, 129, 0.4)"; // Jade green grid dots
        for (let px = 0; px < 1024; px += 10) {
          for (let py = 0; py < 512; py += 10) {
            ctx.fillRect(px, py, 2, 2);
          }
        }
        ctx.restore();
      };

      // Continental Coordinates (X: 0 to 1024, Y: 0 to 512)
      // North America
      drawContinent([
        [100, 120], [130, 80], [210, 60], [320, 40], [360, 80], 
        [380, 150], [340, 200], [380, 220], [360, 260], [320, 280], 
        [285, 290], [250, 280], [240, 220], [200, 190], [140, 190]
      ]);

      // South America
      drawContinent([
        [250, 285], [300, 295], [340, 310], [380, 350], [360, 420], 
        [320, 480], [290, 490], [280, 440], [260, 360], [240, 310]
      ]);

      // Africa
      drawContinent([
        [440, 240], [480, 225], [520, 230], [560, 250], [600, 305], 
        [610, 350], [540, 440], [515, 445], [490, 380], [445, 340], 
        [425, 290]
      ]);

      // Eurasia (combined Europe + Asia)
      drawContinent([
        [410, 180], [460, 120], [510, 100], [600, 70], [700, 50], 
        [850, 60], [920, 80], [940, 140], [920, 210], [860, 235], 
        [830, 280], [800, 290], [770, 250], [680, 275], [630, 260], 
        [570, 270], [500, 230], [430, 220]
      ]);

      // Australia
      drawContinent([
        [780, 350], [840, 345], [890, 370], [880, 410], [820, 450], 
        [770, 420]
      ]);

      // Greenland
      drawContinent([
        [320, 30], [380, 25], [370, 70], [315, 80]
      ]);

      // India peninsula accent
      drawContinent([
        [690, 230], [715, 235], [740, 240], [725, 270], [710, 280], [695, 250]
      ]);

      // Paint glowing city-lights dynamically (warm golden stars)
      ctx.fillStyle = "#facc15"; // Vibrant real amber yellow
      const drawCityLight = (lx: number, ly: number, size = 3.5) => {
        ctx.beginPath();
        ctx.arc(lx, ly, size, 0, Math.PI * 2);
        ctx.fill();
        // Give quick soft border blur
        ctx.fillStyle = "rgba(250, 204, 21, 0.3)";
        ctx.beginPath();
        ctx.arc(lx, ly, size * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#facc15";
      };

      // New York
      drawCityLight(290, 134, 4);
      // Los Angeles
      drawCityLight(182, 172, 3);
      // London
      drawCityLight(462, 128, 3.5);
      // Tokyo / Osaka
      drawCityLight(882, 143, 4.5);
      // Sydney
      drawCityLight(868, 415, 3.5);
      // Rio de Janeiro
      drawCityLight(355, 381, 3);
      // Mumbai / Delhi
      drawCityLight(711, 228, 4);
      // Berlin / Paris
      drawCityLight(495, 131, 3);
      // Johannesburg
      ctx.fillStyle = "#facc15";
      drawCityLight(538, 410, 2.5);
    }

    const texture = new THREE.CanvasTexture(canvas);

    // 7. Globe main sphere with the procedural texture
    const globeGeometry = new THREE.SphereGeometry(2.3, 48, 48);
    const globeMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.5,
      metalness: 0.2,
      bumpScale: 0.08
    });

    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globeMesh);

    // 8. Dynamic atmospheric shroud halo glow
    const atmosphereGeometry = new THREE.SphereGeometry(2.35, 48, 48);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x0891b2,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    // 9. Directional real-time Solar Direction lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.3);
    sunLight.position.set(5, 3, 5); // From right, top, front
    scene.add(sunLight);

    // Quiet cyan back illumination to highlight sphere boundaries
    const backGlowLight = new THREE.DirectionalLight(0x06b6d4, 0.6);
    backGlowLight.position.set(-6, -2, -5);
    scene.add(backGlowLight);

    // 10. Country interaction pins (small glowing vectors)
    const pinsGroup = new THREE.Group();
    globeGroup.add(pinsGroup);

    COUNTRIES_DATABASE.forEach((c) => {
      const vec = latLngToVector3(c.lat, c.lng, 2.31);
      const pinGeom = new THREE.SphereGeometry(0.04, 12, 12);
      const pinMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(c.color),
        transparent: true,
        opacity: 0.95
      });
      const pin = new THREE.Mesh(pinGeom, pinMat);
      pin.position.set(vec.x, vec.y, vec.z);
      pin.name = `pin_${c.code}`;
      pinsGroup.add(pin);
    });

    // 11. Global beacon mesh for highlight pulses
    const beaconGeometry = new THREE.RingGeometry(0.01, 0.18, 20);
    const beaconMaterial = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial);
    globeGroup.add(beacon);
    beaconRef.current = beacon;

    // 12. Frame logic & rotation limits
    let animationFrameId: number;
    let autoRotate = true;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Handle custom inertial rotation drag dampening
      if (!isDragging.current) {
        if (autoRotate) {
          targetRotation.current.y += 0.003; // Slowly advance
        }
        currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;
      }
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;

      if (globeGroup) {
        globeGroup.rotation.y = currentRotation.current.y;
        globeGroup.rotation.x = currentRotation.current.x;
      }

      // Animate beacon scale pulse if active
      if (beacon && beacon.material) {
        const mat = beacon.material as THREE.MeshBasicMaterial;
        if (mat.opacity > 0) {
          beacon.scale.addScalar(0.012);
          mat.opacity -= 0.018;
          if (mat.opacity <= 0) {
            // Reset pulse
            beacon.scale.set(1, 1, 1);
            mat.opacity = 0.95;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize event listener
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Disable auto-rotate when mouse is interacting
    const onPointerDown = (e: PointerEvent) => {
      autoRotate = false;
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      targetRotation.current.y += deltaX * 0.007;
      targetRotation.current.x = Math.max(-0.8, Math.min(0.8, targetRotation.current.x + deltaY * 0.007));

      currentRotation.current.y = targetRotation.current.y;
      currentRotation.current.x = targetRotation.current.x;

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging.current = false;
      // Re-schedule automatic rotation after idle delay
      setTimeout(() => {
        if (!isDragging.current) autoRotate = true;
      }, 4000);
    };

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    dom.addEventListener("pointerup", onPointerUp);

    // Cleanup Resources
    return () => {
      window.removeEventListener("resize", handleResize);
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && dom) {
        mountRef.current.removeChild(dom);
      }
      starsGeometry.dispose();
      starsMaterial.dispose();
      globeGeometry.dispose();
      globeMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      beaconGeometry.dispose();
      beaconMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // Update country light beacon when selected country shifts
  useEffect(() => {
    if (!selectedCountryCode || !globeRef.current || !beaconRef.current) return;

    const match = COUNTRIES_DATABASE.find((c) => c.code === selectedCountryCode);
    if (!match) return;

    // Trigger loading state highlight
    fetchCountryProfile(match.name, match.code);

    // Direct translation
    const vec = latLngToVector3(match.lat, match.lng, 2.32);

    // Look at target coordinate direction to align beacon flat on the surface
    beaconRef.current.position.set(vec.x, vec.y, vec.z);

    // Align the beacon orientation outward
    const lookAtPos = vec.clone().normalize().multiplyScalar(4).add(globeRef.current.position);
    beaconRef.current.lookAt(lookAtPos);
    beaconRef.current.scale.set(1, 1, 1);

    const mat = beaconRef.current.material as THREE.MeshBasicMaterial;
    mat.color.set(match.color);
    mat.opacity = 0.95;

    // Smoothly pan the globe to face the active country coordinate
    // Conversion to target sphere rotations (radians)
    const radLat = match.lat * (Math.PI / 180);
    const radLng = match.lng * (Math.PI / 180);

    // Target polar angles so coordinates rotate facing the camera front (approx -z/z center direction)
    targetRotation.current.x = radLat * 0.55; // damp pitch
    targetRotation.current.y = -radLng - Math.PI / 2; // reverse heading adjust

  }, [selectedCountryCode]);

  // Network fetch for active country explore facts
  const fetchCountryProfile = async (name: string, code: string) => {
    setLoadingCountry(name);
    try {
      const response = await fetch("/api/explore-country", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryName: name, countryCode: code })
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedProfile(data.profile);
        onSelectCountry(data.profile);
      }
    } catch (err) {
      console.error("Failed fetching country profile metric:", err);
    } finally {
      setLoadingCountry(null);
    }
  };

  // Helper converter: degrees to Vector3 coordinates
  function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.sin(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    return new THREE.Vector3(x, y, z);
  }

  // Draw 2D dots for star texture directly
  function createCircleTexture(color: string): THREE.Texture {
    const c = document.createElement("canvas");
    c.width = 16;
    c.height = 16;
    const x = c.getContext("2d");
    if (x) {
      const gradient = x.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.3, "rgba(6, 182, 212, 0.8)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      x.fillStyle = gradient;
      x.fillRect(0, 0, 16, 16);
    }
    return new THREE.CanvasTexture(c);
  }

  return (
    <div className="relative w-full h-[380px] md:h-[500px]">
      {/* Three rendering space */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" id="webgl-canvas-container" />

      {/* Floating interactive beacons label overlay */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap justify-center gap-1.5 pointer-events-auto">
        {COUNTRIES_DATABASE.map((item) => (
          <button
            key={item.code}
            id={`btn-country-${item.code}`}
            onClick={() => fetchCountryProfile(item.name, item.code)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-all duration-300 flex items-center gap-1.5 backdrop-blur-md ${
              selectedCountryCode === item.code
                ? "bg-cyan-950/80 text-cyan-200 border-cyan-400 font-semibold shadow-[0_0_12px_rgba(34,211,238,0.3)]Scale-105"
                : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white"
            }`}
          >
            <span
              className="inline-block w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: item.color }}
            />
            {item.name}
          </button>
        ))}
      </div>

      {/* Sphere loading indicator */}
      {loadingCountry && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none">
          <div className="bg-slate-950/90 text-cyan-400 border border-cyan-800/60 px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 backdrop-blur-md shadow-lg">
            <svg className="animate-spin h-3.5 w-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Scanning database for {loadingCountry}...
          </div>
        </div>
      )}

      {/* Subtle guidance instructions in bottom right */}
      <div className="absolute bottom-2 right-4 pointer-events-none text-[10px] text-slate-500 font-mono tracking-wider bg-slate-950/20 px-2 py-0.5 rounded">
        DRAG TO ORBIT / SCROLL TO ZOOM
      </div>
    </div>
  );
};
