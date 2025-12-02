import { useRef, useMemo, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";

const latLongToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

const airports = [
  { name: "São Paulo", lat: -23.5505, lon: -46.6333, code: "GRU" },
  { name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729, code: "GIG" },
  { name: "Brasília", lat: -15.7942, lon: -47.8822, code: "BSB" },
  { name: "Belo Horizonte", lat: -19.9167, lon: -43.9345, code: "CNF" },
  { name: "Salvador", lat: -12.9714, lon: -38.5014, code: "SSA" },
  { name: "Recife", lat: -8.0476, lon: -34.877, code: "REC" },
  { name: "Porto Alegre", lat: -30.0346, lon: -51.2177, code: "POA" },
  { name: "Fortaleza", lat: -3.7172, lon: -38.5433, code: "FOR" },
  { name: "Buenos Aires", lat: -34.6037, lon: -58.3816, code: "EZE" },
  { name: "Santiago", lat: -33.4489, lon: -70.6693, code: "SCL" },
  { name: "Lima", lat: -12.0464, lon: -77.0428, code: "LIM" },
  { name: "Bogotá", lat: 4.711, lon: -74.0721, code: "BOG" },
  { name: "Caracas", lat: 10.4806, lon: -66.9036, code: "CCS" },
  { name: "Montevidéu", lat: -34.9011, lon: -56.1645, code: "MVD" },
  { name: "Asunción", lat: -25.2637, lon: -57.5759, code: "ASU" },
  { name: "La Paz", lat: -16.2902, lon: -68.1332, code: "LPB" },
  { name: "Miami", lat: 25.7617, lon: -80.1918, code: "MIA" },
  { name: "Nova York", lat: 40.7128, lon: -74.006, code: "JFK" },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437, code: "LAX" },
  { name: "Orlando", lat: 28.5383, lon: -81.3792, code: "MCO" },
  { name: "Toronto", lat: 43.6532, lon: -79.3832, code: "YYZ" },
  { name: "Cidade do México", lat: 19.4326, lon: -99.1332, code: "MEX" },
  { name: "Panamá", lat: 8.9824, lon: -79.5199, code: "PTY" },
  { name: "Quito", lat: -0.1807, lon: -78.4678, code: "UIO" },
  { name: "Madrid", lat: 40.4168, lon: -3.7038, code: "MAD" },
  { name: "Lisboa", lat: 38.7223, lon: -9.1393, code: "LIS" },
  { name: "Paris", lat: 48.8566, lon: 2.3522, code: "CDG" },
  { name: "Londres", lat: 51.5074, lon: -0.1278, code: "LHR" },
  { name: "Joanesburgo", lat: -26.2041, lon: 28.0473, code: "JNB" },
  { name: "Cairo", lat: 30.0444, lon: 31.2357, code: "CAI" },
  { name: "Casablanca", lat: 33.5731, lon: -7.5898, code: "CMN" },
  { name: "Lagos", lat: 6.5244, lon: 3.3792, code: "LOS" },
  { name: "Nairobi", lat: -1.2921, lon: 36.8219, code: "NBO" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, code: "SYD" },
  { name: "Melbourne", lat: -37.8136, lon: 144.9631, code: "MEL" },
  { name: "Auckland", lat: -36.8485, lon: 174.7633, code: "AKL" },
  { name: "Wellington", lat: -41.2865, lon: 174.7762, code: "WLG" },
  { name: "Tóquio", lat: 35.6762, lon: 139.6503, code: "NRT" },
  { name: "Osaka", lat: 34.6937, lon: 135.5023, code: "KIX" },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, code: "DXB" },
];

const connections = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [0, 6],
  [0, 7],
  [0, 8],
  [0, 33],
  [1, 2],
  [1, 3],
  [1, 8],
  [2, 3],
  [2, 4],
  [2, 5],
  [8, 9],
  [8, 30],
  [9, 10],
  [9, 31],
  [10, 11],
  [10, 39],
  [10, 40],
  [11, 12],
  [11, 39],
  [12, 33],
  [12, 38],
  [30, 25],
  [31, 25],
  [32, 10],
  [32, 27],
  [33, 34],
  [33, 35],
  [33, 36],
  [33, 37],
  [33, 38],
  [33, 41],
  [33, 42],
  [34, 35],
  [34, 37],
  [34, 41],
  [34, 42],
  [34, 43],
  [34, 44],
  [35, 37],
  [35, 54],
  [36, 33],
  [37, 34],
  [38, 33],
  [38, 39],
  [38, 40],
  [41, 42],
  [41, 43],
  [41, 44],
  [41, 47],
  [41, 56],
  [42, 43],
  [42, 44],
  [42, 47],
  [43, 44],
  [43, 45],
  [43, 46],
  [44, 45],
  [44, 46],
  [45, 46],
  [45, 48],
  [45, 49],
  [46, 47],
  [46, 48],
  [47, 42],
  [48, 49],
  [50, 51],
  [50, 52],
  [51, 52],
  [52, 53],
  [54, 55],
  [54, 56],
  [54, 50],
  [55, 54],
  [55, 56],
  [56, 57],
  [56, 43],
  [56, 46],
  [57, 56],
  [57, 43],
  [57, 46],
  [30, 8],
  [31, 9],
  [32, 9],
  [32, 25],
  [40, 28],
  [40, 39],
  [49, 45],
  [48, 46],
  [50, 33],
  [50, 54],
  [51, 33],
  [51, 50],
  [52, 33],
  [52, 50],
  [53, 50],
  [53, 52],
  [54, 34],
  [54, 35],
  [55, 54],
  [55, 56],
];

const AnimatedPlane = ({
  start,
  end,
  delay,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  delay: number;
}) => {
  const planeRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(delay);

  useFrame((_, delta) => {
    if (!planeRef.current) return;

    progressRef.current += delta * 0.15;

    if (progressRef.current > 1) {
      progressRef.current = 0;
    }

    const t = (Math.sin(progressRef.current * Math.PI - Math.PI / 2) + 1) / 2;
    const position = start.clone().lerp(end, t);
    planeRef.current.position.copy(position);

    const direction = end.clone().sub(start).normalize();
    planeRef.current.lookAt(position.clone().add(direction));
  });

  return (
    <mesh ref={planeRef} position={start}>
      <coneGeometry args={[0.02, 0.08, 3]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={1.0}
      />
    </mesh>
  );
};

const AirportMarker = ({ position }: { position: THREE.Vector3 }) => {
  const markerRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (markerRef.current) {
      markerRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh ref={markerRef}>
        <Sphere args={[0.05, 16, 16]}>
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1.5}
          />
        </Sphere>
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <ringGeometry args={[0.03, 0.05, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.0}
        />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <coneGeometry args={[0.02, 0.04, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.2}
        />
      </mesh>
    </group>
  );
};

export const Scene3D = () => {
  const globeGroupRef = useRef<THREE.Group>(null);
  const radius = 2.5;

  const [earthTexture] = useState(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.Texture();

    const texture = new THREE.CanvasTexture(canvas);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 2048, 1024);
      const imageData = ctx.getImageData(0, 0, 2048, 1024);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * 1.2);
        data[i + 1] = Math.min(255, data[i + 1] * 1.2);
        data[i + 2] = Math.min(255, data[i + 2] * 1.2);
      }
      ctx.putImageData(imageData, 0, 0);
      texture.needsUpdate = true;
    };
    img.onerror = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
      gradient.addColorStop(0, "#87ceeb");
      gradient.addColorStop(0.3, "#b0e0e6");
      gradient.addColorStop(0.5, "#e0f6ff");
      gradient.addColorStop(0.7, "#b0e0e6");
      gradient.addColorStop(1, "#87ceeb");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 2048, 1024);
      texture.needsUpdate = true;
    };
    img.src =
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg";

    return texture;
  });

  const earthBumpMap = useLoader(
    TextureLoader,
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg"
  );

  const airportPositions = useMemo(
    () =>
      airports.map((airport) =>
        latLongToVector3(airport.lat, airport.lon, radius)
      ),
    []
  );

  useFrame(() => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 5, 5]} intensity={2.0} color="#ffffff" />
      <directionalLight
        position={[-5, -5, -5]}
        intensity={0.8}
        color="#ffffff"
      />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, 10, -10]} intensity={1.0} color="#ffffff" />

      <group ref={globeGroupRef}>
        <Sphere args={[radius, 128, 128]}>
          <meshStandardMaterial
            map={earthTexture}
            normalMap={earthBumpMap}
            metalness={0.0}
            roughness={0.6}
            emissive="#ffffff"
            emissiveIntensity={0.1}
          />
        </Sphere>

        {airportPositions.map((position, index) => (
          <AirportMarker key={index} position={position} />
        ))}

        {connections.map((connection, index) => {
          const start = airportPositions[connection[0]];
          const end = airportPositions[connection[1]];

          if (!start || !end) {
            return null;
          }

          const curve = new THREE.QuadraticBezierCurve3(
            start,
            start
              .clone()
              .add(end)
              .multiplyScalar(0.5)
              .normalize()
              .multiplyScalar(radius + 0.3),
            end
          );
          const curvePoints = curve.getPoints(50);

          return (
            <group key={index}>
              <Line
                points={curvePoints}
                color="#ffffff"
                lineWidth={3}
                dashed={false}
                transparent
                opacity={0.8}
              />
              <AnimatedPlane start={start} end={end} delay={index * 0.2} />
            </group>
          );
        })}
      </group>

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={4}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
};
