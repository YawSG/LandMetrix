import React, { useState, Suspense, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  AppBar,
  Toolbar,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

// Add this to your existing VIEW_TYPES
const VIEW_TYPES = {
  BASE: 'base',
  TAX: 'tax',
  ZONING: 'zoning'
};

// Zoning categories with their colors
const ZONING_TYPES = {
  COMMERCIAL: {
    id: 'commercial',
    label: 'Commercial',
    color: '#0074D9'
  },
  AGRICULTURAL: {
    id: 'agricultural',
    label: 'Agricultural',
    color: '#FF851B'
  },
  RESIDENTIAL: {
    id: 'residential',
    label: 'Residential',
    color: '#2ECC40'
  }
};

// Building Material Helper
const buildingMaterial = (color, metalness = 0.5, roughness = 0.2) => (
  <meshStandardMaterial
    color={color}
    metalness={metalness}
    roughness={roughness}
    envMapIntensity={0.5}
  />
);

// Day-Night Cycle Component
const DayNightCycle = ({ onLightingUpdate }) => {
  const sunRef = useRef();
  const [dayTime, setDayTime] = useState(0);

  useFrame((state, delta) => {
    const newTime = (dayTime + delta / 60) % 1;
    setDayTime(newTime);

    const angle = newTime * Math.PI * 2;
    const radius = 20;
    const height = Math.sin(angle) * radius;
    const horizontal = Math.cos(angle) * radius;

    if (sunRef.current) {
      sunRef.current.position.set(horizontal, height, 0);
    }

    const intensity = Math.max(0.2, Math.sin(angle) * 0.8 + 0.2);
    const color = new THREE.Color(
      1,
      Math.max(0.8, Math.sin(angle) * 0.2 + 0.8),
      Math.max(0.6, Math.sin(angle) * 0.4 + 0.6)
    );

    onLightingUpdate(intensity, color);
  });

  return (
    <directionalLight
      ref={sunRef}
      intensity={1}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-far={50}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={10}
      shadow-camera-bottom={-10}
    />
  );
};

// Updated Commercial Building with reflective materials
const CommercialBuilding = ({ position }) => (
  <group position={position}>
    {/* Main tower */}
    <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.6, 1.2, 0.6]} />
      {buildingMaterial("#cbd5e1", 0.7, 0.2)}
    </mesh>
   
    {/* Glass facade */}
    <mesh position={[0, 0.6, 0.31]} castShadow>
      <boxGeometry args={[0.5, 1.0, 0.01]} />
      {buildingMaterial("#38bdf8", 0.9, 0.1)}
    </mesh>
   
    {/* Accent strips */}
    <mesh position={[0, 0.6, 0.32]} castShadow>
      <boxGeometry args={[0.6, 1.2, 0.005]} />
      {buildingMaterial("#737373", 0.8, 0.1)}
    </mesh>
   
    {/* Roof structure */}
    <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.7, 0.1, 0.7]} />
      {buildingMaterial("#94a3b8", 0.6, 0.3)}
    </mesh>
   
    {/* Entrance */}
    <mesh position={[0, 0.15, 0.31]} castShadow>
      <boxGeometry args={[0.2, 0.3, 0.01]} />
      {buildingMaterial("#475569", 0.5, 0.5)}
    </mesh>
   
    {/* Decorative columns */}
    {[-0.25, 0.25].map((x) => (
      <mesh key={x} position={[x, 0.6, 0.32]} castShadow>
        <boxGeometry args={[0.08, 1.2, 0.08]} />
        {buildingMaterial("#94a3b8", 0.3, 0.7)}
      </mesh>
    ))}
   
    {/* Roof details */}
    <mesh position={[0, 1.3, 0]} castShadow>
      <cylinderGeometry args={[0.1, 0.2, 0.1, 8]} />
      {buildingMaterial("#64748b", 0.4, 0.6)}
    </mesh>
  </group>
);

// Updated Residential House with reflective materials
const ResidentialHouse = ({ position }) => (
  <group position={position}>
    {/* Main house structure */}
    <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.7, 0.5, 0.6]} />
      {buildingMaterial("#e2e8f0", 0.1, 0.8)}
    </mesh>
   
    {/* Modern slanted roof */}
    <mesh position={[0, 0.55, 0]} rotation={[0.2, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.8, 0.2, 0.7]} />
      {buildingMaterial("#94a3b8", 0.6, 0.3)}
    </mesh>
   
    {/* Front window */}
    <mesh position={[0, 0.3, 0.31]} castShadow>
      <boxGeometry args={[0.2, 0.2, 0.01]} />
      {buildingMaterial("#38bdf8", 0.9, 0.1)}
    </mesh>
   
    {/* Side windows */}
    <mesh position={[0.36, 0.3, 0]} castShadow>
      <boxGeometry args={[0.01, 0.2, 0.2]} />
      {buildingMaterial("#38bdf8", 0.9, 0.1)}
    </mesh>
   
    {/* Door */}
    <mesh position={[0, 0.2, 0.31]} castShadow>
      <boxGeometry args={[0.15, 0.4, 0.01]} />
      {buildingMaterial("#475569", 0.3, 0.7)}
    </mesh>
   
    {/* Garage */}
    <mesh position={[-0.2, 0.15, 0.31]} castShadow>
      <boxGeometry args={[0.25, 0.3, 0.01]} />
      {buildingMaterial("#475569", 0.3, 0.7)}
    </mesh>
   
    {/* Garden decoration */}
    <mesh position={[0.25, 0.05, 0.2]} castShadow>
      <cylinderGeometry args={[0.1, 0.1, 0.1, 8]} />
      {buildingMaterial("#15803d", 0.1, 0.9)}
    </mesh>
  </group>
);

// Updated Luxury Residential House Variant
const LuxuryHouse = ({ position }) => (
  <group position={position}>
    // Main structure
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[0.8, 0.6, 0.7]} />
      <meshStandardMaterial color="#f8fafc" />
    </mesh>
   
    // Modern flat roof with overhang
    <mesh position={[0, 0.65, 0]}>
      <boxGeometry args={[0.9, 0.1, 0.8]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
   
    // Large panoramic window
    <mesh position={[0, 0.4, 0.36]}>
      <boxGeometry args={[0.4, 0.3, 0.01]} />
      <meshStandardMaterial
        color="#38bdf8"
        metalness={0.6}
        roughness={0.2}
        transparent
        opacity={0.4}
      />
    </mesh>
   
    // Modern entrance
    <mesh position={[0.2, 0.2, 0.36]}>
      <boxGeometry args={[0.2, 0.4, 0.01]} />
      <meshStandardMaterial color="#334155" />
    </mesh>
   
    // Decorative water feature
    <mesh position={[-0.3, 0.1, 0.2]}>
      <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
      <meshStandardMaterial color="#0ea5e9" />
    </mesh>
   
    // Accent lighting
    {[-0.35, 0.35].map((x) => (
      <mesh key={x} position={[x, 0.15, 0.36]}>
        <boxGeometry args={[0.05, 0.05, 0.02]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
    ))}
  </group>
);

// Modern Office Tower
const OfficeTower = ({ position }) => (
  <group position={position}>
    // Main tower structure
    <mesh position={[0, 0.8, 0]}>
      <boxGeometry args={[0.5, 1.6, 0.5]} />
      <meshStandardMaterial color="#e2e8f0" metalness={0.4} roughness={0.6} />
    </mesh>
   
    // Glass curtain wall
    {[-0.26, 0, 0.26].map((x) => (
      <mesh key={x} position={[x, 0.8, 0]}>
        <boxGeometry args={[0.02, 1.5, 0.48]} />
        <meshStandardMaterial
          color="#38bdf8"
          metalness={0.8}
          roughness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>
    ))}
   
    // Roof structure
    <mesh position={[0, 1.65, 0]}>
      <boxGeometry args={[0.6, 0.1, 0.6]} />
      <meshStandardMaterial color="#475569" />
    </mesh>
   
    // Antenna spire
    <mesh position={[0, 1.9, 0]}>
      <cylinderGeometry args={[0.02, 0.01, 0.5]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
   
    // Entrance plaza
    <mesh position={[0, 0.05, 0.3]}>
      <boxGeometry args={[0.6, 0.1, 0.2]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
   
    // Revolving door
    <mesh position={[0, 0.15, 0.4]}>
      <cylinderGeometry args={[0.1, 0.1, 0.2, 12]} />
      <meshStandardMaterial
        color="#38bdf8"
        metalness={0.6}
        roughness={0.2}
        transparent
        opacity={0.4}
      />
    </mesh>
  </group>
);

// Tree Component (needed for grid)
const Tree = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.3, 0]} castShadow>
      <cylinderGeometry args={[0.05, 0.05, 0.6]} />
      <meshStandardMaterial color="#784421" />
    </mesh>
    <mesh position={[0, 0.7, 0]} castShadow>
      <coneGeometry args={[0.2, 0.6, 8]} />
      <meshStandardMaterial color="#2F4F2F" />
    </mesh>
  </group>
);
  
const Tree2 = ({ position }) => {
  const treeType = React.useMemo(() => {
    return Math.floor(Math.random() * 3);
  }, []);

  const renderConiferousTree = () => (
      <group position={position}>
        {/* Complex trunk with bark texture effect */}
        <group position={[0, 0.3, 0]}>
          {/* Main trunk */}
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.6, 8]} />
            <meshStandardMaterial color="#513A2A" roughness={0.9} metalness={0.1} />
          </mesh>

          {/* Bark texture details */}
          {[...Array(8)].map((_, i) => (
              <mesh key={i} position={[
                Math.sin(i * Math.PI/4) * 0.06,
                Math.random() * 0.5,
                Math.cos(i * Math.PI/4) * 0.06
              ]} castShadow>
                <boxGeometry args={[0.02, 0.05, 0.01]} />
                <meshStandardMaterial color="#3D2B20" roughness={1} />
              </mesh>
          ))}
        </group>

        {/* Multi-layered pine needles */}
        <group position={[0, 0.5, 0]}>
          {[...Array(5)].map((_, i) => {
            const y = i * 0.15;
            const scale = 1 - (i * 0.15);
            return (
                <group key={i} position={[0, y, 0]}>
                  {/* Main cone layer */}
                  <mesh castShadow>
                    <coneGeometry args={[0.25 * scale, 0.3, 8]} />
                    <meshStandardMaterial color={i % 2 ? "#1B4D2E" : "#2D5A27"} />
                  </mesh>

                  {/* Detailed needle clusters */}
                  {[...Array(8)].map((_, j) => (
                      <group key={j} rotation={[0, (j * Math.PI) / 4, 0]}>
                        <mesh position={[0.15 * scale, -0.05, 0]} rotation={[0, 0, Math.PI * 0.15]} castShadow>
                          <coneGeometry args={[0.05 * scale, 0.2, 4]} />
                          <meshStandardMaterial color={j % 2 ? "#233D26" : "#1B4D2E"} />
                        </mesh>
                      </group>
                  ))}
                </group>
            );
          })}
        </group>
      </group>
  );

  const renderDeciduousTree = () => (
      <group position={position}>
        {/* Detailed trunk with root flare */}
        <group position={[0, 0.2, 0]}>
          {/* Main trunk */}
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.5, 8]} />
            <meshStandardMaterial color="#614126" roughness={0.9} />
          </mesh>

          {/* Root flare */}
          {[...Array(6)].map((_, i) => (
              <group key={i} rotation={[0, (i * Math.PI) / 3, 0]}>
                <mesh position={[0.1, -0.2, 0]} rotation={[0, 0, Math.PI * 0.25]} castShadow>
                  <cylinderGeometry args={[0.03, 0.06, 0.2, 4]} />
                  <meshStandardMaterial color="#523620" />
                </mesh>
              </group>
          ))}
        </group>

        {/* Complex branch structure */}
        <group position={[0, 0.5, 0]}>
          {[...Array(4)].map((_, i) => (
              <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
                {/* Primary branches */}
                <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, Math.PI * 0.25]} castShadow>
                  <cylinderGeometry args={[0.03, 0.05, 0.3, 4]} />
                  <meshStandardMaterial color="#614126" />
                </mesh>

                {/* Secondary branches */}
                <group position={[0.3, 0.2, 0]}>
                  {[...Array(3)].map((_, j) => (
                      <mesh key={j} position={[0.1 * j, 0.1 * j, 0]} rotation={[0, 0, Math.PI * 0.15]} castShadow>
                        <cylinderGeometry args={[0.02, 0.03, 0.2, 3]} />
                        <meshStandardMaterial color="#614126" />
                      </mesh>
                  ))}
                </group>
              </group>
          ))}
        </group>

        {/* Multi-layered foliage */}
        <group position={[0, 0.7, 0]}>
          {/* Dense leaf clusters */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * Math.PI) / 6;
            const radius = 0.3;
            return (
                <group key={i} position={[
                  Math.sin(angle) * radius,
                  Math.random() * 0.4,
                  Math.cos(angle) * radius
                ]}>
                  <mesh castShadow>
                    <sphereGeometry args={[0.15, 6, 6]} />
                    <meshStandardMaterial color={i % 3 === 0 ? "#2D5A27" : i % 2 ? "#1B4D2E" : "#3A6B35"} />
                  </mesh>
                  {/* Individual leaf clusters */}
                  {[...Array(4)].map((_, j) => (
                      <mesh key={j} position={[
                        Math.random() * 0.1 - 0.05,
                        Math.random() * 0.1,
                        Math.random() * 0.1 - 0.05
                      ]} castShadow>
                        <sphereGeometry args={[0.08, 4, 4]} />
                        <meshStandardMaterial color={j % 2 ? "#2D5A27" : "#3A6B35"} />
                      </mesh>
                  ))}
                </group>
            );
          })}
        </group>
      </group>
  );

  const renderWillowTree = () => (
      <group position={position}>
        {/* Gnarled trunk */}
        <group position={[0, 0.3, 0]}>
          <mesh rotation={[0, 0, 0.1]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.7, 8]} />
            <meshStandardMaterial color="#4A3728" roughness={0.9} />
          </mesh>

          {/* Trunk texture details */}
          {[...Array(10)].map((_, i) => (
              <mesh key={i} position={[
                Math.sin(i * Math.PI/5) * 0.08,
                Math.random() * 0.6,
                Math.cos(i * Math.PI/5) * 0.08
              ]} rotation={[0, i * Math.PI/5, 0]} castShadow>
                <boxGeometry args={[0.02, 0.04, 0.01]} />
                <meshStandardMaterial color="#3D2B20" />
              </mesh>
          ))}
        </group>

        {/* Complex drooping branch structure */}
        <group position={[0, 0.8, 0]}>
          {/* Central crown */}
          <mesh castShadow>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="#4A5D23" />
          </mesh>

          {/* Intricate drooping branches */}
          {[...Array(16)].map((_, i) => {
            const angle = (i * Math.PI) / 8;
            return (
                <group key={i} rotation={[0.6, angle, 0]}>
                  {/* Main drooping branch */}
                  <mesh position={[0, -0.2, 0]} castShadow>
                    <cylinderGeometry args={[0.02, 0.01, 0.6, 4]} />
                    <meshStandardMaterial color="#2F3D1C" />
                  </mesh>

                  {/* Sub-branches with leaves */}
                  {[...Array(6)].map((_, j) => {
                    const subAngle = (j * Math.PI) / 3;
                    return (
                        <group key={j} position={[0, -0.1 * (j + 1), 0]} rotation={[0, subAngle, 0]}>
                          <mesh position={[0.05, 0, 0]} castShadow>
                            <cylinderGeometry args={[0.01, 0.005, 0.15, 3]} />
                            <meshStandardMaterial color="#2F3D1C" />
                          </mesh>
                          {/* Leaf clusters */}
                          <group position={[0.12, 0, 0]}>
                            {[...Array(3)].map((_, k) => (
                                <mesh key={k} position={[0.02 * k, 0, 0]} rotation={[Math.random(), Math.random(), Math.random()]} castShadow>
                                  <sphereGeometry args={[0.03, 4, 4]} />
                                  <meshStandardMaterial color={k % 2 ? "#4A5D23" : "#3A4D1C"} />
                                </mesh>
                            ))}
                          </group>
                        </group>
                    );
                  })}
                </group>
            );
          })}
        </group>
      </group>
  );

    return renderConiferousTree();
}


const SpecialBuilding = ({ position, type }) => {
  const colors = {
    police: '#1E40AF',   // Dark blue
    fire: '#DC2626',     // Red
    health: '#059669',   // Green
    train: '#1F2937'     // Dark gray
  };

  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={colors[type]} />
      </mesh>
    </group>
  );
};
// Lake Component (needed for grid)
const Lake = ({ position, size }) => (
  <mesh position={[position[0], 0.01, position[2]]}>
    <boxGeometry args={[size[0], 0.01, size[1]]} />
    <meshStandardMaterial 
      color="#60A5FA" 
      transparent 
      opacity={0.8}
      metalness={0.3}
      roughness={0.4}
    />
  </mesh>
);

// Junction Component with higher markings
const Junction = ({ position }) => {
  return (
    <group position={position}>
      {/* Junction base */}
      <mesh position={[0, 0.021, 0]} receiveShadow>
        <boxGeometry args={[1, 0.04, 1]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>

      {/* Give way lines (triangles) - UK style - raised higher */}
      {[0, Math.PI/2, Math.PI, -Math.PI/2].map((rotation, index) => (
        <group key={index} rotation={[0, rotation, 0]} position={[0, 0.040, 0]}>
          {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[0, 0, -0.35 + (i * 0.1)]}>
              <boxGeometry args={[0.1, 0.01, 0.05]} />
              <meshStandardMaterial color="#fff" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

// Updated Road Component with only center dotted lines
const Road = ({ position, isHorizontal = false }) => {
  const rotation = isHorizontal ? [0, 0, 0] : [0, Math.PI / 2, 0];
  
  return (
    <group position={position} rotation={rotation}>
      {/* Road base */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[1, 0.04, 0.7]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>

      {/* Center dotted lines - raised higher */}
      {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.040, 0]}>
          <boxGeometry args={[0.1, 0.01, 0.05]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      ))}
    </group>
  );
};

// First, fix the RoadRail component syntax
const RoadRail = ({ position }) => (
  <group>
    {/* Road part */}
    <group position={position}>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[1, 0.04, 0.7]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>

      {/* Center dotted lines - raised higher */}
      {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.040, 0]}>
          <boxGeometry args={[0.1, 0.01, 0.05]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      ))}
    </group>

    {/* Rail part */}
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      {[-0.1, 0.1].map((z, idx) => (
        <mesh key={idx} position={[0, 0.05, z]}>
          <boxGeometry args={[1, 0.03, 0.05]} />
          <meshStandardMaterial color="#71717A" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  </group>
);

// Railroad Component (needed for grid)
const Railroad = ({ position }) => (
  <group position={position} rotation={[0, Math.PI / 2, 0]}>
    <mesh position={[0, 0.02, 0]} receiveShadow>
      <boxGeometry args={[1, 0.04, 0.4]} />
      <meshStandardMaterial color="#4B5563" />
    </mesh>
    {[-0.1, 0.1].map((z, idx) => (
      <mesh key={idx} position={[0, 0.05, z]}>
        <boxGeometry args={[1, 0.03, 0.05]} />
        <meshStandardMaterial color="#71717A" metalness={0.8} roughness={0.2} />
      </mesh>
    ))}
  </group>
);

const getTaxGradientColor = (value, minTax, maxTax) => {
  // Normalize the value between 0 and 1
  const normalized = (value - minTax) / (maxTax - minTax);

  // Convert from light green to dark green
  const r = Math.round(144 - (normalized * 144)); // From 144 to 0
  const g = Math.round(238 - (normalized * 138)); // From 238 to 100
  const b = Math.round(144 - (normalized * 144)); // From 144 to 0

  return `rgb(${r}, ${g}, ${b})`;
};

// Fixed the plots array definition
const plots = [
  {
    id: "0xAB12CD",
    squares: [[8, 8]], // 2x2 plot
    type: "residential"
  },

  {
    id: "0xDY12HS",
    squares: [[6, 6],[6, 7],[6, 8],[7, 6],[7, 7],[7, 8]], // 2x2 plot
    type: "residential"
  },
  {
    id: "0xUY83EH",
    squares: [[9, 7],[8, 7],[8, 6]], // 2x2 plot
    type: "residential"
  },
  {
    id: "0xDF90WM",
    squares: [[10, 8],], // 2x2 plot
    type: "residential"
  },
  {
    id: "0xKD05AY",
    squares: [[10, 9],[11, 9],[12, 9],[12, 8],], // 2x2 plot
    type: "residential"
  },

  {
    id: "0xNB12UF",
    squares: [[8, 9], [8, 10]], // 2x2 plot
    type: "residential"
  },
  {
    id: "0xGB16GT",
    squares: [[7, 10], [7, 9]],  // 2x2 plot
    type: "residential"
  },
  {
    id: "0xFB56HT",
    squares:  [[6, 10], [6, 9]],  // 2x2 plot
    type: "unused"
  },
  {
    id: "0xEF34GH",
    squares: [[10, 10], [11, 10],], // 1x3 plot
    type: "residential"
  },
  {
    id: "0xSH38AG",
    squares: [[6, 12], [7, 12],], // 1x3 plot
    type: "residential"
  },
  {
    id: "0xEF04SH",
    squares: [[6, 13], [6, 14], [7, 13], [7, 14],], // 1x3 plot
    type: "residential"
  },
  {
    id: "0xKD89KF",
    squares: [[8, 12],[8, 13],[8, 14]], // 2x2 plot
    type: "residential"
  },
  {
    id: "0xFG38ZU",
    squares: [[9, 12],[9, 13],[9, 14]], // 2x2 plot
    type: "residential"
  },
  {
    id: "0xTY10DH",
    squares: [[10, 12],[10, 13],[10, 14],[11, 12],[11, 13],[11, 14]], // 2x2 plot
    type: "residential"
  },
  {
    id: "0xQX12KS",
    squares: [[13, 6],[13, 7],[13, 8],[13, 9],[13, 10],[14, 6],[14, 7],[14, 8],[14, 9],[14, 10]], // 2x2 plot
    type: "residential"
  },
  {
    id: "0xOP99AU",
    squares: [[4, 10], [3, 10],], // 1x3 plot
    type: "services"
  },
  {
    id: "0xSG36AT",
    squares: [[4, 14], [3, 14],], // 1x3 plot
    type: "residential"
  },
  {
    id: "0xDT24EC",
    squares: [[4, 13], [3, 13], [4, 12], [3, 12],], // 1x3 plot
    type: "residential"
  },
  {
    id: "0xSY37EG",
    squares: [[4, 11], [3, 11],], // 1x3 plot
    type: "residential"
  },
  {
    id: "0xAU37EG",
    squares: [[4, 9], [3, 9],], // 1x3 plot
    type: "residential"
  },
  {
    id: "0xDG76QL",
    squares: [[4, 8], [3, 8],], // 1x3 plot
    type: "residential"
  },
  {
    id: "0xYB45SU",
    squares: [[4, 7], [3, 7],], // 1x3 plot
    type: "residential"
  },
  {
    id: "0xZY28RN",
    squares: [[4, 6], [3, 6],], // 1x3 plot
    type: "residential"
  },
  {
    id: "0xSB75PF",
    squares: [[2, 4], [2, 5],], // 1x3 plot
    type: "residential"
  },
  {
    id: "0xYC27EC",
    squares: [[4, 0], [3, 0],], // 1x3 plot
    type: "residential"
  },
  {
    id: "0xEH06RF",
    squares: [[4, 1], [3, 1],], // 1x3 plot
    type: "residential"
  },
  {
    id: "0xJD94SJ",
    squares: [[1, 2], [2, 2],], // 1x3 plot
    type: "commercial"
  },
  {
    id: "0xMQ36OL",
    squares: [[3, 2]], // 1x3 plot
    type: "commercial"
  },
  {
    id: "0xLA61KJ",
    squares: [[4, 2],], // 1x3 plot
    type: "commercial"
  },
  {
    id: "0xSF98RH",
    squares: [[3, 4], [3, 5],], // 1x3 plot
    type: "commercial"
  },
  {
    id: "0xPK97EF",
    squares: [[4, 5],], // 1x3 plot
    type: "commercial"
  },
  {
    id: "0xVG84SV",
    squares: [[6, 2], [6, 3],], // 1x3 plot
    type: "services"
  },
  {
    id: "0xJE82LG",
    squares: [[6, 1],], // 1x3 plot
    type: "commercial"
  },
  {
    id: "0xPF94EJ",
    squares: [[6, 4],], // 1x3 plot
    type: "commercial"
  },
  {
    id: "0xCH72MF",
    squares: [[6, 5],], // 1x3 plot
    type: "commercial"
  },
  {
    id: "0xWM37SU",
    squares: [[12, 10],], // 1x3 plot
    type: "commercial"
  },
  {
    id: "0xFG46HT",
    squares: [[12, 12],[13, 12],[14, 12]], // 2x2 plot
    type: "residential"
  },
  {
    id: "0xYJ34RH",
    squares: [[4, 4],], // 1x3 plot
    type: "services"
  },
  {
    id: "0xSJ09EY",
    squares: [[1, 0], [1, 1], [2, 0], [2, 1],], // 1x3 plot
    type: "unused"
  },
  {
    id: "0xCH61PF",
    squares: [[6, 0],], // 1x3 plot
    type: "unused"
  },
  {
    id: "0xIM72AM",
    squares: [[7, 0],[7, 1],[7, 2],[7, 3],[7, 4],[7, 5],[8, 0],[8, 1],[8, 2],[8, 3],[8, 4],[8, 5],[9, 2],[9, 3],], // 2x2 plot
    type: "unused"
  },
  {
    id: "0xNN33SH",
    squares: [
      [9, 0], [9, 1],
      [10, 0], [10, 1], [10, 2],
      [11, 0], [11, 1], [11, 2],
      [12, 0], [12, 1], [12, 2], [12, 3],
      [13, 0], [13, 1], [13, 2], [13, 3],
      [14, 0], [14, 1], [14, 2], [14, 3]
    ],
    type: "unused"
  },
  {
    id: "0xVD09XX",
    squares: [[13, 4], [13, 5], [14, 4], [14, 5],], // 1x3 plot
    type: "unused"
  },
  {
    id: "0xQW56SS",
    squares: [[1, 4], [1, 5],], // 1x3 plot
    type: "services"
  },
  {
    id: "0xL88RJ",
    squares: [[1, 6],[1, 7],[1, 8],[2, 6],[2, 7],[2, 8]], // 2x2 plot
    type: "unused"
  },
  {
    id: "0xIG23GS",
    squares: [[1, 9],[1, 10],[1, 11],[2, 9],[2, 10],[2, 11]], // 2x2 plot
    type: "unused"
  },
  {
    id: "0xZZ45SD",
    squares: [[1, 12],[1, 13],[1, 14],[2, 12],[2, 13],[2, 14]], // 2x2 plot
    type: "unused"
  },
  {
    id: "0xWX93CQ",
    squares: [[12, 13],[12, 14],[13, 13],[13, 14],[14, 13],[14, 14]], // 2x2 plot
    type: "unused"
  },
];

// Fixed the findPlotByCoordinates function
const findPlotByCoordinates = (col, row) => {
  return plots.find(plot => 
    plot.squares.some(([x, y]) => x === col && y === row)
  );
};

// Fixed the generateInitialGrid function
const generateInitialGrid = () => {
  const grid = [];
  const size = 15;
  const startOffset = -7;

  const junctions = [
    [5, 3],   // Main east-west and north-south road intersection
    [5, 11],  // Upper road intersection
    [9, 11]   // Upper road intersection with vertical road
  ];

  // Helper functions for expanding ranges
  const expandYRanges = (ranges) => {
    const expanded = [];
    for (const [x, yStart, yEnd] of ranges) {
      for (let y = yStart; y <= yEnd; y++) {
        expanded.push([x, y]);
      }
    }
    return expanded;
  };

  const expandXRanges = (ranges) => {
    const expanded = [];
    for (const [xStart, xEnd, y] of ranges) {
      for (let x = xStart; x <= xEnd; x++) {
        expanded.push([x, y]);
      }
    }
    return expanded;
  };

  // Define all your features
  const horizontalRoads = expandXRanges([[1, 4, 3], [6, 14, 11]]);
  const verticalRoads = expandYRanges([[5, 0, 14], [9, 8, 10]]);

  const features = {
    lake: expandYRanges([[9, 4, 6], [10, 3, 7], [11, 3, 8], [12, 4, 7]]),
    forest: expandYRanges([[1, 7, 9], [2, 8, 9], [7, 2, 3], [8, 2, 4],
                         [9, 1, 3], [10, 0, 2], [11, 0, 2], [12, 0, 2],
                         [13, 0, 3], [13, 6, 7], [14, 0, 2], [14, 6, 8]]),
    roads: {
      horizontal: horizontalRoads,
      vertical: verticalRoads
    },
    roadRail: [[0, 3]],
    railroad: expandYRanges([[0, 0, 14]]),
    residential: [
      [2, 4], [4, 0], [4, 1], [4, 6], [4, 7], [4, 9], [4, 11], [4, 13], [4, 14],
      [6, 7], [6, 12], [6, 14], [7, 10], [8, 8], [8, 10], [8, 12],
      [9, 7], [9, 12], [10, 8], [10, 9], [10, 10], [10, 12], [14, 10]
    ],
    commercial: [
      [1, 2], [3, 2], [3, 4], [4, 2], [4, 5],
      [6, 1], [6, 4], [6, 5], [12, 10], [13, 12]
    ],
    special: {
      police: [[6, 3]],
      fire: [[4, 4]],
      health: [[4, 10]],
      train: [[1, 4]]
    }
  };

  // Generate the grid
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const plot = findPlotByCoordinates(col, row);
      let tileType = 'empty';
      let isHorizontalRoad = false;

      // Determine tile type
      if (junctions.some(([x, y]) => x === col && y === row)) {
        tileType = 'junction';
      }
      else if (features.roadRail.some(([x, y]) => x === col && y === row)) {
        tileType = 'roadRail';
      }
      else if (features.lake.some(([x, y]) => x === col && y === row)) {
        tileType = 'lake';
      } else if (features.forest.some(([x, y]) => x === col && y === row)) {
        tileType = 'forest';
      } else if (features.residential.some(([x, y]) => x === col && y === row)) {
        tileType = 'residential';
      } else if (features.commercial.some(([x, y]) => x === col && y === row)) {
        tileType = 'commercial';
      } else if (features.special.police.some(([x, y]) => x === col && y === row)) {
        tileType = 'police';
      } else if (features.special.fire.some(([x, y]) => x === col && y === row)) {
        tileType = 'fire';
      } else if (features.special.health.some(([x, y]) => x === col && y === row)) {
        tileType = 'health';
      } else if (features.special.train.some(([x, y]) => x === col && y === row)) {
        tileType = 'train';
      } else if (features.railroad.some(([x, y]) => x === col && y === row)) {
        tileType = 'railroad';
      } else if (features.roads.horizontal.some(([x, y]) => x === col && y === row)) {
        tileType = 'road';
        isHorizontalRoad = true;
      } else if (features.roads.vertical.some(([x, y]) => x === col && y === row)) {
        tileType = 'road';
        isHorizontalRoad = false;
      }

      grid.push({
        id: row * size + col,
        position: [startOffset + col, 0, startOffset + row],
        type: tileType,
        isHorizontalRoad,
        coordinates: [col, row],
        plotId: plot?.id
      });
    }
  }

  return grid;
};

const initialZoningAssignments = {
  // Commercial zones
  "0xJD94SJ": ZONING_TYPES.COMMERCIAL.id,
  "0xMQ36OL": ZONING_TYPES.COMMERCIAL.id,
  "0xLA61KJ": ZONING_TYPES.COMMERCIAL.id,
  "0xSF98RH": ZONING_TYPES.COMMERCIAL.id,
  "0xPK97EF": ZONING_TYPES.COMMERCIAL.id,
  "0xJE82LG": ZONING_TYPES.COMMERCIAL.id,
  "0xPF94EJ": ZONING_TYPES.COMMERCIAL.id,
  "0xCH72MF": ZONING_TYPES.COMMERCIAL.id,
  "0xQW56SS": ZONING_TYPES.COMMERCIAL.id,
  "0xSB75PF": ZONING_TYPES.COMMERCIAL.id,
  "0xYJ34RH": ZONING_TYPES.COMMERCIAL.id,
  "0xVG84SV": ZONING_TYPES.COMMERCIAL.id,
  "0xCH61PF": ZONING_TYPES.COMMERCIAL.id,

  // Agricultural zones (currently unused plots)

  "0xIM72AM": ZONING_TYPES.AGRICULTURAL.id,
  "0xNN33SH": ZONING_TYPES.AGRICULTURAL.id,
  "0xL88RJ": ZONING_TYPES.AGRICULTURAL.id,
  "0xIG23GS": ZONING_TYPES.AGRICULTURAL.id,
  "0xZZ45SD": ZONING_TYPES.AGRICULTURAL.id,
  "0xTY10DH": ZONING_TYPES.AGRICULTURAL.id,
  "0xFG46HT": ZONING_TYPES.AGRICULTURAL.id,
  "0xWX93CQ": ZONING_TYPES.AGRICULTURAL.id,
  "0xVD09XX": ZONING_TYPES.AGRICULTURAL.id,

  // Residential zones
  "0xAB12CD": ZONING_TYPES.RESIDENTIAL.id,
  "0xDY12HS": ZONING_TYPES.RESIDENTIAL.id,
  "0xUY83EH": ZONING_TYPES.RESIDENTIAL.id,
  "0xDF90WM": ZONING_TYPES.RESIDENTIAL.id,
  "0xKD05AY": ZONING_TYPES.RESIDENTIAL.id,
  "0xNB12UF": ZONING_TYPES.RESIDENTIAL.id,
  "0xGB16GT": ZONING_TYPES.RESIDENTIAL.id,
  "0xEF34GH": ZONING_TYPES.RESIDENTIAL.id,
  "0xSH38AG": ZONING_TYPES.RESIDENTIAL.id,
  "0xEF04SH": ZONING_TYPES.RESIDENTIAL.id,
  "0xKD89KF": ZONING_TYPES.RESIDENTIAL.id,
  "0xFG38ZU": ZONING_TYPES.RESIDENTIAL.id,
  "0xYC27EC": ZONING_TYPES.RESIDENTIAL.id,
  "0xZY28RN": ZONING_TYPES.RESIDENTIAL.id,
  "0xYB45SU": ZONING_TYPES.RESIDENTIAL.id,
  "0xAU37EG": ZONING_TYPES.RESIDENTIAL.id,
  "0xSY37EG": ZONING_TYPES.RESIDENTIAL.id,
  "0xDT24EC": ZONING_TYPES.RESIDENTIAL.id,
  "0xEH06RF": ZONING_TYPES.RESIDENTIAL.id,
  "0xSG36AT": ZONING_TYPES.RESIDENTIAL.id,
  "0xOP99AU": ZONING_TYPES.RESIDENTIAL.id,
  "0xDG76QL": ZONING_TYPES.RESIDENTIAL.id,
  "0xFB56HT": ZONING_TYPES.RESIDENTIAL.id,
  "0xWM37SU": ZONING_TYPES.RESIDENTIAL.id,
  "0xQX12KS": ZONING_TYPES.RESIDENTIAL.id,
  "0xSJ09EY": ZONING_TYPES.RESIDENTIAL.id,
};

const ZoningManager = ({ selectedPlotId, onZoningChange }) => {
  const [zoningAssignments, setZoningAssignments] = useState(initialZoningAssignments);

  const handleZoningChange = (value) => {
    const newAssignments = {
      ...zoningAssignments,
      [selectedPlotId]: value
    };
    setZoningAssignments(newAssignments);
    onZoningChange(newAssignments);
  };

  if (!selectedPlotId) return null;

  return (
    <Card className="mt-4">
      <CardHeader>Zoning Management</CardHeader>
      <CardContent>
        <Select
          value={zoningAssignments[selectedPlotId] || ''}
          onValueChange={handleZoningChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select zone type" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ZONING_TYPES).map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

const Bridge = ({ position }) => (
  <group position={position}>
    {/* Main road surface */}
    <mesh position={[0, 0.5, 0]} receiveShadow>
      <boxGeometry args={[0.7, 0.05, 1]} />
      <meshStandardMaterial color="#666666" roughness={0.9} />
    </mesh>

    {/* Road markings - center line */}
    {[-0.35, -0.15, 0.05, 0.25].map((z) => (
      <mesh key={z} position={[0, 0.53, z]} receiveShadow>
        <boxGeometry args={[0.05, 0.01, 0.15]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    ))}

    {/* Detailed Bridge Support Structure */}
    {/* Main support columns */}
    {[-0.4, 0.4].map((x) => (
      <group key={x} position={[x, 0, 0]}>
        {/* Column base with decorative elements */}
        <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.3, 0.15]} />
          <meshStandardMaterial color="#7B8994" roughness={0.8} />
        </mesh>

        {/* Column decorative top */}
        <mesh position={[0, 0.31, 0]} castShadow>
          <boxGeometry args={[0.2, 0.02, 0.2]} />
          <meshStandardMaterial color="#9CA3AF" metalness={0.3} roughness={0.7} />
        </mesh>

        {/* Detailed column texturing - vertical ridges */}
        {[0, Math.PI/2, Math.PI, Math.PI*1.5].map((rotation, i) => (
          <mesh key={i} position={[0, 0.15, 0]} rotation={[0, rotation, 0]} castShadow>
            <boxGeometry args={[0.16, 0.28, 0.01]} />
            <meshStandardMaterial color="#8B939E" />
          </mesh>
        ))}
      </group>
    ))}

    {/* Intricate side barriers */}
    {[-1, 1].map((side) => (
      <group key={side} position={[side * 0.3, 0.5, 0]}>
        {/* Main barrier structure */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.05, 0.2, 1]} />
          <meshStandardMaterial color="#4B5563" metalness={0.4} roughness={0.6} />
        </mesh>

        {/* Decorative barrier posts */}
        {[-0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45].map((z) => (
          <group key={z} position={[0, 0, z]}>
            <mesh position={[0, 0.15, 0]} castShadow>
              <boxGeometry args={[0.07, 0.25, 0.07]} />
              <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Post cap */}
            <mesh position={[0, 0.28, 0]} castShadow>
              <boxGeometry args={[0.09, 0.03, 0.09]} />
              <meshStandardMaterial color="#4B5563" metalness={0.6} roughness={0.4} />
            </mesh>
          </group>
        ))}

        {/* Horizontal barrier railings */}
        {[0.05, 0.15, 0.25].map((y) => (
          <mesh key={y} position={[0, y, 0]} castShadow>
            <boxGeometry args={[0.03, 0.02, 1]} />
            <meshStandardMaterial color="#6B7280" metalness={0.5} roughness={0.5} />
          </mesh>
        ))}
      </group>
    ))}

    {/* Arch support structure */}
    <group>
      {/* Main arch */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#64748B" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Arch reinforcement ribs */}
      {[-0.4, -0.2, 0, 0.2, 0.4].map((z) => (
        <mesh key={z} position={[0, 0.25, z]} castShadow>
          <cylinderGeometry args={[0.52, 0.52, 0.05, 32, 1, true, 0, Math.PI]} />
          <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
    </group>

    {/* Decorative elements */}
    {/* Corner pillars with detailed caps */}
    {[[-0.3, -0.45], [-0.3, 0.45], [0.3, -0.45], [0.3, 0.45]].map(([x, z], i) => (
      <group key={i} position={[x, 0.5, z]}>
        {/* Pillar base */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 0.3, 0.1]} />
          <meshStandardMaterial color="#4B5563" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Ornate cap */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[0.12, 0.05, 0.12]} />
          <meshStandardMaterial color="#6B7280" metalness={0.4} roughness={0.6} />
        </mesh>
        {/* Top sphere */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#9CA3AF" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>
    ))}

    {/* Weathering and detail effects */}
    {[...Array(20)].map((_, i) => (
      <mesh key={i} position={[
        Math.random() * 0.6 - 0.3,
        0.51,
        Math.random() * 0.8 - 0.4
      ]} receiveShadow>
        <boxGeometry args={[0.02, 0.001, 0.02]} />
        <meshStandardMaterial color="#4B5563" roughness={1} />
      </mesh>
    ))}

    {/* Support structure underneath */}
    {[-0.2, 0, 0.2].map((z) => (
      <group key={z} position={[0, 0.3, z]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.05, 0.05]} />
          <meshStandardMaterial color="#64748B" metalness={0.4} roughness={0.6} />
        </mesh>
        {/* Cross bracing */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.2, -0.1, 0]} rotation={[0, 0, side * Math.PI/4]} castShadow>
            <boxGeometry args={[0.3, 0.05, 0.05]} />
            <meshStandardMaterial color="#64748B" metalness={0.4} roughness={0.6} />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

// Helper function to get zoning color
const getZoningColor = (plotId, zoningAssignments) => {
  const zoneType = zoningAssignments[plotId];
  return ZONING_TYPES[zoneType?.toUpperCase()]?.color || '#808080';
};

const Tile = ({
  position,
  type,
  plotId,
  coordinates,
  isSelected,
  onClick,
  isHorizontalRoad,
  hoveredPlotId,
  onHover,
  viewType,
  taxValue,
  minTax,
  maxTax,
  zoningAssignments,
}) => {
  const [localHovered, setLocalHovered] = useState(false);
  const glowRef = useRef();

  const isPartOfPlot = plotId && plotId.length > 0;
  const isPlotHovered = hoveredPlotId === plotId;

  // Update glow intensity
  useFrame(() => {
    if (glowRef.current && (isPlotHovered || isSelected)) {
      glowRef.current.intensity = 1 + Math.sin(Date.now() / 300) * 0.3;
    }
  });

  const handlePointerOver = () => {
    setLocalHovered(true);
    if (plotId) {
      onHover(plotId);
    }
  };

  const handlePointerOut = () => {
    setLocalHovered(false);
    onHover(null);
  };

  const getTileColor = () => {
    if (viewType === VIEW_TYPES.ZONING && plotId) {
      return getZoningColor(plotId, zoningAssignments);
    }
    if (viewType === VIEW_TYPES.TAX && plotId) {
      return getTaxGradientColor(taxValue, minTax, maxTax);
    }
    return type === 'lake' ? '#4ade80' : '#4ade80';
  };

  const renderContent = () => {
    switch (type) {
      case 'residential':
        return <ResidentialHouse position={[0, 0, 0]} />;
      case 'commercial':
        return <CommercialBuilding position={[0, 0, 0]} />;
      case 'forest':
        return <Tree position={[0, 0, 0]} />;
      case 'roadRail':
        return <RoadRail position={[0, 0, 0]} />;
      case 'police':
        return (
          <group position={[0, 0, 0]}>
            {/* Main police station building */}
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.7, 0.6, 0.6]} />
              {buildingMaterial("#1e40af", 0.3, 0.7)}
            </mesh>

            {/* Front entrance with steps */}
            <mesh position={[0, 0.15, 0.31]} castShadow>
              <boxGeometry args={[0.3, 0.3, 0.05]} />
              {buildingMaterial("#94a3b8", 0.4, 0.6)}
            </mesh>

            {/* Glass entrance */}
            <mesh position={[0, 0.3, 0.33]} castShadow>
              <boxGeometry args={[0.2, 0.4, 0.01]} />
              {buildingMaterial("#38bdf8", 0.9, 0.1)}
            </mesh>

            {/* Side wings */}
            {[-0.4, 0.4].map((x, i) => (
              <mesh key={i} position={[x, 0.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.2, 0.4, 0.5]} />
                {buildingMaterial("#1e3a8a", 0.3, 0.7)}
              </mesh>
            ))}

            {/* Police sign illumination */}
            <mesh position={[0, 0.65, 0.31]} castShadow>
              <boxGeometry args={[0.4, 0.1, 0.02]} />
              {buildingMaterial("#3b82f6", 0.8, 0.2)}
            </mesh>

            {/* Antenna */}
            <mesh position={[0.3, 0.7, 0]} castShadow>
              <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
              {buildingMaterial("#94a3b8", 0.7, 0.3)}
            </mesh>
          </group>
        );
      case 'fire':
        return (
          <group position={[0, 0, 0]}>
            {/* Main fire station building */}
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.8, 0.6, 0.6]} />
              {buildingMaterial("#dc2626", 0.3, 0.7)}
            </mesh>

            {/* Garage doors */}
            {[-0.2, 0.2].map((x, i) => (
              <mesh key={i} position={[x, 0.25, 0.31]} castShadow>
                <boxGeometry args={[0.3, 0.4, 0.01]} />
                {buildingMaterial("#cbd5e1", 0.6, 0.3)}
              </mesh>
            ))}

            {/* Watch tower */}
            <mesh position={[0.3, 0.8, 0]} castShadow>
              <boxGeometry args={[0.2, 0.4, 0.2]} />
              {buildingMaterial("#dc2626", 0.3, 0.7)}
            </mesh>

            {/* Tower windows */}
            <mesh position={[0.3, 0.8, 0.11]} castShadow>
              <boxGeometry args={[0.15, 0.2, 0.01]} />
              {buildingMaterial("#38bdf8", 0.9, 0.1)}
            </mesh>

            {/* Tower roof */}
            <mesh position={[0.3, 1.05, 0]} castShadow>
              <boxGeometry args={[0.25, 0.1, 0.25]} />
              {buildingMaterial("#94a3b8", 0.4, 0.6)}
            </mesh>

            {/* Emergency light */}
            <mesh position={[0, 0.65, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
              {buildingMaterial("#ef4444", 0.8, 0.2)}
            </mesh>
          </group>
        );
      case 'health':
        return (
          <group position={[0, 0, 0]}>
            {/* Main hospital building */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.8, 0.8, 0.6]} />
              {buildingMaterial("#f8fafc", 0.2, 0.8)}
            </mesh>

            {/* Emergency entrance overhang */}
            <mesh position={[0, 0.3, 0.31]} castShadow>
              <boxGeometry args={[0.4, 0.1, 0.2]} />
              {buildingMaterial("#e2e8f0", 0.3, 0.7)}
            </mesh>

            {/* Helipad */}
            <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.4, 0.05, 0.4]} />
              {buildingMaterial("#475569", 0.4, 0.6)}
            </mesh>

            {/* Helipad markings */}
            <mesh position={[0, 0.88, 0]} castShadow>
              <boxGeometry args={[0.25, 0.01, 0.25]} />
              {buildingMaterial("#059669", 0.1, 0.9)}
            </mesh>

            {/* Emergency sign */}
            <mesh position={[0, 0.5, 0.31]} castShadow>
              <boxGeometry args={[0.2, 0.2, 0.01]} />
              {buildingMaterial("#ef4444", 0.3, 0.7)}
            </mesh>

            {/* Windows */}
            {[-0.25, 0, 0.25].map((x, i) => (
              <group key={i}>
                {[0.2, 0.4, 0.6].map((y, j) => (
                  <mesh key={`${i}-${j}`} position={[x, y, 0.31]} castShadow>
                    <boxGeometry args={[0.15, 0.15, 0.01]} />
                    {buildingMaterial("#38bdf8", 0.9, 0.1)}
                  </mesh>
                ))}
              </group>
            ))}

            {/* Emergency vehicle entrance */}
            <mesh position={[-0.3, 0.2, 0.31]} castShadow>
              <boxGeometry args={[0.3, 0.4, 0.01]} />
              {buildingMaterial("#94a3b8", 0.6, 0.4)}
            </mesh>
          </group>
        );
      case 'junction':
        return <Junction position={[0, 0, 0]} />;
      case 'train':
        return <group position={[0, 0, 0]}>
          {/* Main station building */}
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.8, 0.8, 0.5]} />
            {buildingMaterial("#f8fafc", 0.3, 0.7)} {/* White stone */}
          </mesh>

          {/* Victorian-style clock tower */}
          <group position={[0.25, 0, 0]}>
            {/* Tower base */}
            <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.3, 1.2, 0.3]} />
              {buildingMaterial("#e2e8f0", 0.4, 0.6)} {/* Light gray stone */}
            </mesh>

            {/* Clock faces */}
            {[0, Math.PI/2, Math.PI, -Math.PI/2].map((rotation, index) => (
                <group key={index} rotation={[0, rotation, 0]}>
                  <mesh position={[0, 1.2, 0.16]} castShadow>
                    <boxGeometry args={[0.2, 0.2, 0.02]} />
                    {buildingMaterial("#f8fafc", 0.1, 0.9)} {/* White clock face */}
                  </mesh>
                  {/* Clock hands */}
                  <mesh position={[0, 1.2, 0.17]} castShadow>
                    <boxGeometry args={[0.02, 0.1, 0.01]} />
                    {buildingMaterial("#1e293b", 0.8, 0.2)} {/* Dark metal hands */}
                  </mesh>
                </group>
            ))}

            {/* Tower spire */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0, 0.2, 0.4, 8]} />
              {buildingMaterial("#94a3b8", 0.6, 0.4)} {/* Metal spire */}
            </mesh>
          </group>

          {/* Platform canopy */}
          <group position={[-0.4, 0, 0]}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.8, 0.05, 0.8]} />
              {buildingMaterial("#64748b", 0.7, 0.3)} {/* Metal roof */}
            </mesh>

            {/* Canopy supports */}
            {[-0.35, 0, 0.35].map((z) => (
                <mesh key={z} position={[0, 0.25, z]} castShadow>
                  <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
                  {buildingMaterial("#475569", 0.8, 0.2)} {/* Metal supports */}
                </mesh>
            ))}
          </group>

          {/* Main entrance */}
          <mesh position={[0, 0.3, 0.26]} castShadow>
            <boxGeometry args={[0.3, 0.6, 0.02]} />
            {buildingMaterial("#475569", 0.6, 0.4)} {/* Dark entrance */}
          </mesh>

          {/* Decorative arched windows */}
          {[-0.25, 0.25].map((x) => (
              <mesh key={x} position={[x, 0.5, 0.26]} castShadow>
                <boxGeometry args={[0.2, 0.3, 0.02]} />
                {buildingMaterial("#38bdf8", 0.9, 0.1)} {/* Glass windows */}
              </mesh>
          ))}

          {/* Platform base */}
          <mesh position={[-0.4, 0.1, 0]} receiveShadow>
            <boxGeometry args={[0.8, 0.2, 0.8]} />
            {buildingMaterial("#94a3b8", 0.2, 0.8)} {/* Concrete platform */}
          </mesh>

          {/* Platform markings */}
          <mesh position={[-0.4, 0.21, 0]} receiveShadow>
            <boxGeometry args={[0.7, 0.01, 0.1]} />
            {buildingMaterial("#fbbf24", 0.1, 0.9)} {/* Yellow safety line */}
          </mesh>

          {/* Information boards */}
          <mesh position={[-0.4, 0.4, 0]} castShadow>
            <boxGeometry args={[0.4, 0.2, 0.02]} />
            {buildingMaterial("#1e293b", 0.3, 0.7)} {/* Dark display board */}
          </mesh>

          {/* Station name sign */}
          <mesh position={[0, 0.85, 0.26]} castShadow>
            <boxGeometry args={[0.6, 0.15, 0.02]} />
            {buildingMaterial("#1e293b", 0.4, 0.6)} {/* Dark sign background */}
          </mesh>

          {/* Ticket windows */}
          {[-0.15, 0.15].map((x) => (
              <mesh key={x} position={[x, 0.3, 0.26]} castShadow>
                <boxGeometry args={[0.1, 0.1, 0.02]} />
                {buildingMaterial("#38bdf8", 0.9, 0.1)} {/* Glass windows */}
              </mesh>
          ))}
        </group>;
      case 'road':
        return <Road position={[0, 0, 0]} isHorizontal={isHorizontalRoad} />;
      case 'lake':
        return <Lake position={[0, 0, 0]} size={[1, 1]} />;
      case 'railroad':
        return <Railroad position={[0, 0, 0]} />;
      default:
        return null;
    }
  };
return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (plotId) onClick(plotId);
      }}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Base tile */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[1, 0.01, 1]} />
        <meshStandardMaterial
          color={getTileColor()}
          transparent
          opacity={type === 'lake' ? 0 : 0.5}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>

      {/* Selected state */}
      {isPartOfPlot && isSelected && (
        <>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[1.02, 0.04, 1.02]} />
            <meshBasicMaterial
                color="#028202"
              transparent
              opacity={0.8}
            />
          </mesh>
          <pointLight
            ref={glowRef}
            position={[0, 0.1, 0]}
            intensity={1}
            distance={1.5}
            color="#028202"
          />
        </>
      )}

      {/* Hover state */}
      {isPartOfPlot && isPlotHovered && !isSelected && (
        <>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[1.02, 0.04, 1.02]} />
            <meshBasicMaterial
              color="#628262"
              transparent
              opacity={0.8}
            />
          </mesh>
          <pointLight
            ref={glowRef}
            position={[0, 0.1, 0]}
            intensity={1}
            distance={1.5}
            color="#628262"
          />
        </>
      )}

      {renderContent()}
    </group>
  );
};

// Calculate Land Value for a single tile
const calculateTileLandValue = (coordinates, zoningType) => {
  const [x, y] = coordinates;
  let value = 0;

  // P1: Road proximity
  const roads = [
    ...horizontalRoads,
    ...verticalRoads
  ];

  const nearestRoadDist = Math.min(...roads.map(([rx, ry]) =>
    Math.sqrt(Math.pow(x - rx, 2) + Math.pow(y - ry, 2))
  ));

  if (nearestRoadDist <= 1) value += 5000;
  else if (nearestRoadDist <= 2) value += 2500;

  // P2: Public Transport (Train station)
  const trainStationDist = Math.sqrt(Math.pow(x - 1, 2) + Math.pow(y - 4, 2));
  if (trainStationDist <= 2) value += 10000;

  // P3: Essential Services (Hospital)
  const hospitalDist = Math.sqrt(Math.pow(x - 4, 2) + Math.pow(y - 10, 2));
  if (hospitalDist <= 3) value += 7500;

  // Z1: Zoning Influence
  switch (zoningType) {
    case ZONING_TYPES.COMMERCIAL.id:
      value += 60000;
      break;
    case ZONING_TYPES.RESIDENTIAL.id:
      value += 30000;
      break;
    case ZONING_TYPES.AGRICULTURAL.id:
      value += 10000;
      break;
  }

  // E1: Lake proximity
  const lake = features.lake;
  const nearestLakeDist = Math.min(...lake.map(([lx, ly]) =>
    Math.sqrt(Math.pow(x - lx, 2) + Math.pow(y - ly, 2))
  ));

  if (nearestLakeDist <= 1) value += 5000;
  else if (nearestLakeDist <= 2) value += 2500;

  return value;
};

// Calculate Land Value for entire plot
const calculatePlotValue = (plot) => {
  if (!plot) return 0;

  // Calculate value for each tile in the plot
  const tileValues = plot.squares.map(([x, y]) => {
    let tileValue = 0;

    // P1: Roads proximity
    const nearRoads = [
      [5, 0, 14], // Vertical road
      [9, 8, 10], // Another vertical road
      [1, 3, 4], // Horizontal road
      [6, 11, 14] // Another horizontal road
    ];

    const isAdjacentToRoad = nearRoads.some(([roadX, startY, endY]) =>
      (Math.abs(x - roadX) <= 1 && y >= startY && y <= endY) ||
      (Math.abs(y - roadX) <= 1 && x >= startY && x <= endY)
    );

    if (isAdjacentToRoad) {
      tileValue += 5000;
    } else if (nearRoads.some(([roadX, startY, endY]) =>
      (Math.abs(x - roadX) <= 2 && y >= startY && y <= endY) ||
      (Math.abs(y - roadX) <= 2 && x >= startY && x <= endY)
    )) {
      tileValue += 2500;
    }

    // P2: Public Transport (Train Station)
    const trainStationLocation = [1, 4];
    const trainDistance = Math.sqrt(
      Math.pow(x - trainStationLocation[0], 2) +
      Math.pow(y - trainStationLocation[1], 2)
    );
    if (trainDistance <= 2) {
      tileValue += 10000;
    }

    // P3: Essential Services (Hospital)
    const hospitalLocation = [4, 10];
    const hospitalDistance = Math.sqrt(
      Math.pow(x - hospitalLocation[0], 2) +
      Math.pow(y - hospitalLocation[1], 2)
    );
    if (hospitalDistance <= 3) {
      tileValue += 7500;
    }

    // Z1: Zoning Influence
    const zoneType = initialZoningAssignments[plot.id];
    switch (zoneType) {
      case 'commercial':
        tileValue += 60000;
        break;
      case 'residential':
        tileValue += 30000;
        break;
      case 'agricultural':
        tileValue += 10000;
        break;
    }

    // E1: Lake proximity
    const lakeLocations = [
      [9, 4], [9, 5], [9, 6],
      [10, 3], [10, 4], [10, 5], [10, 6], [10, 7],
      [11, 3], [11, 4], [11, 5], [11, 6], [11, 7], [11, 8],
      [12, 4], [12, 5], [12, 6], [12, 7]
    ];

    const isAdjacentToLake = lakeLocations.some(([lakeX, lakeY]) =>
      Math.abs(x - lakeX) <= 1 && Math.abs(y - lakeY) <= 1
    );

    if (isAdjacentToLake) {
      tileValue += 5000;
    } else if (lakeLocations.some(([lakeX, lakeY]) =>
      Math.abs(x - lakeX) <= 2 && Math.abs(y - lakeY) <= 2
    )) {
      tileValue += 2500;
    }

    return tileValue;
  });

  // Calculate average tile value and scale to plot size
  const avgTileValue = tileValues.reduce((sum, value) => sum + value, 0) / tileValues.length;
  return Math.round(avgTileValue * tileValues.length);
};

const calculateLVT = (plot) => {
  if (!plot) return 0;

  const plotValue = calculatePlotValue(plot);
  const zoneType = initialZoningAssignments[plot.id];

  // Tax rates based on zoning
  const taxRates = {
    commercial: 0.05, // 5%
    residential: 0.03, // 3%
    agricultural: 0.01 // 1%
  };

  const taxRate = taxRates[zoneType] || 0.01; // Default to 1% if zone not found
  return Math.round(plotValue * taxRate);
};

const calculateTaxValue = (plot) => {
  if (!plot) return 0;

  const baseValue = calculatePlotValue(plot);

  // Tax rate varies by type
  const taxRates = {
    residential: 0.015, // 1.5%
    commercial: 0.025,  // 2.5%
    services: 0.02,     // 2%
    unused: 0.01       // 1%
  };

  return Math.round(baseValue * (taxRates[plot.type] || 0.01));
};

const calculatePlotValueWH = (plot, excludeBuildings = false) => {
  if (!plot) return 0;

  // Helper function to check if a plot has any buildings
  const hasBuildings = (plot) => {
    // A plot has buildings if its type is residential, commercial, or services
    // and it's not marked as unused
    return ['residential', 'commercial', 'services'].includes(plot.type) &&
           plot.type !== 'unused';
  };

  // If no buildings exist on the plot, use the calculatePlotValue function
  if (!hasBuildings(plot)) {
    return calculatePlotValue(plot);
  }

  // Base value per square with buildings
  const baseValues = {
    residential: 70000,
    commercial: 200000,
    services: 3000000,
    unused: 3500
  };

  // If excluding buildings, use the base land value
  const baseValue = excludeBuildings ? 3500 : (baseValues[plot.type] || 3500);

  // Size multiplier (larger plots are worth more per square)
  const sizeMultiplier = 1 + (plot.squares.length * 0.1);

  // Location bonuses (check if near special buildings or roads)
  const hasLocationBonus = plot.squares.some(([x, y]) => {
    const nearSpecial = [
      [6, 3], // police
      [4, 4], // fire
      [4, 10], // health
      [1, 4]  // train
    ].some(([sx, sy]) => Math.abs(x - sx) <= 2 && Math.abs(y - sy) <= 2);

    const nearRoad = x === 5 || y === 3 || y === 11;
    return nearSpecial || nearRoad;
  });

  const locationMultiplier = hasLocationBonus ? 1.5 : 1;

  // Calculate plot size
  const plotSize = plot.squares.length;

  return Math.round(baseValue * plotSize * sizeMultiplier * locationMultiplier);
};

const SidebarContent = ({
                          selectedPlotId,
                          plots,
                          viewType,
                          zoningAssignments,
                          onZoningChange,
                          VIEW_TYPES,
                          ZONING_TYPES
                        }) => {
  if (!selectedPlotId) {
    return (
        <Typography variant="body2" color="text.secondary">
          Select a plot to view details
        </Typography>
    );
  }

  const plot = plots.find(p => p.id === selectedPlotId);
  if (!plot) return null;

  const plotValueWithBuildings = calculatePlotValueWH(plot);
  const plotValueWithoutBuildings = calculatePlotValueWH(plot, true);

  return (
      <>
        <Typography variant="h6" gutterBottom>
          Plot Information
        </Typography>
        <Divider sx={{ my: 2 }} />

        <List>
          <ListItem>
            <ListItemText primary="Plot ID" secondary={plot.id} />
          </ListItem>
          <ListItem>
            <ListItemText
                primary="Type"
                secondary={plot.type.charAt(0).toUpperCase() + plot.type.slice(1)}
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Size" secondary={`${plot.squares.length} squares`} />
          </ListItem>
          <ListItem>
            <ListItemText
                primary="Location"
                secondary={`${plot.squares.map(([x, y]) => `(${x},${y})`).join(', ')}`}
            />
          </ListItem>
        </List>

        <Paper elevation={3} sx={{ p: 2, mt: 2, bgcolor: '#028202', color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            Estimated Value (With Buildings)
          </Typography>
          <Typography variant="h4">
            ${plotValueWithBuildings.toLocaleString()}
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 2, mt: 2, bgcolor: '#028202', color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            Estimated Value (Without Buildings)
          </Typography>
          <Typography variant="h4">
            ${plotValueWithoutBuildings.toLocaleString()}
          </Typography>
        </Paper>
        <Paper elevation={3} sx={{ p: 2, mt: 2, bgcolor: '#028202', color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            Annual Land Value Tax
          </Typography>
          <Typography variant="h4">
            £{calculateLVT(plot).toLocaleString()}
          </Typography>
        </Paper>

        {viewType === VIEW_TYPES.ZONING && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Zoning Management
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Zone Type</InputLabel>
                <Select
                    value={zoningAssignments[selectedPlotId] || ''}
                    onChange={(e) => onZoningChange({
                      ...zoningAssignments,
                      [selectedPlotId]: e.target.value
                    })}
                    label="Zone Type"
                >
                  {Object.values(ZONING_TYPES).map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.label}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
        )}
      </>
  );
};

const LandValueExplorer = () => {
  const [viewType, setViewType] = useState(VIEW_TYPES.BASE);
  const [taxRange, setTaxRange] = useState({ min: 0, max: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState(null);
  const [hoveredPlotId, setHoveredPlotId] = useState(null);
  const [sceneIntensity, setSceneIntensity] = useState(1);
  const [lightColor, setLightColor] = useState(new THREE.Color(1, 1, 1));
  const [zoningAssignments, setZoningAssignments] = useState(initialZoningAssignments);
  const containerRef = useRef();

  useEffect(() => {
    const taxValues = plots.map(plot => calculateTaxValue(plot));
    setTaxRange({
      min: Math.min(...taxValues),
      max: Math.max(...taxValues)
    });
  }, []);

  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
      <Box
          ref={containerRef}
          sx={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column'
          }}
      >
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Land Value Explorer
            </Typography>
            <ButtonGroup variant="contained" sx={{ mr: 2 }}>
              <Button
                  onClick={() => setViewType(VIEW_TYPES.BASE)}
                  color={viewType === VIEW_TYPES.BASE ? 'primary' : 'inherit'}
              >
                Base View
              </Button>
              <Button
                  onClick={() => setViewType(VIEW_TYPES.TAX)}
                  color={viewType === VIEW_TYPES.TAX ? 'primary' : 'inherit'}
              >
                Tax View
              </Button>
              <Button
                  onClick={() => setViewType(VIEW_TYPES.ZONING)}
                  color={viewType === VIEW_TYPES.ZONING ? 'primary' : 'inherit'}
              >
                Zoning View
              </Button>
            </ButtonGroup>
            <IconButton onClick={handleFullscreenToggle}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Canvas
                shadows
                camera={{
                  position: [10, 10, 10],
                  fov: 60
                }}
            >
              <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                />
                <DayNightCycle
                    onLightingUpdate={(intensity, color) => {
                      setSceneIntensity(intensity);
                      setLightColor(color);
                    }}
                />
                {generateInitialGrid().map((tile) => {
                  const plot = plots.find(p => p.id === tile.plotId);
                  const taxValue = calculateTaxValue(plot);

                  return (
                      <Tile
                          key={tile.id}
                          {...tile}
                          isSelected={selectedPlotId === tile.plotId}
                          hoveredPlotId={hoveredPlotId}
                          onClick={setSelectedPlotId}
                          onHover={(id) => setHoveredPlotId(id)}
                          viewType={viewType}
                          taxValue={taxValue}
                          minTax={taxRange.min}
                          maxTax={taxRange.max}
                          zoningAssignments={zoningAssignments}
                      />
                  );
                })}
                <OrbitControls
                    target={[0, 0, 0]}
                    maxPolarAngle={Math.PI / 2}
                    minDistance={5}
                    maxDistance={20}
                />
              </Suspense>
            </Canvas>
          </Box>

          {!isFullscreen && (
              <Card
                  sx={{
                    width: 320,
                    m: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto'
                  }}
              >
                <CardContent>
                  <SidebarContent
                      selectedPlotId={selectedPlotId}
                      plots={plots}
                      viewType={viewType}
                      zoningAssignments={zoningAssignments}
                      onZoningChange={setZoningAssignments}
                      VIEW_TYPES={VIEW_TYPES}
                      ZONING_TYPES={ZONING_TYPES}
                  />
                </CardContent>
              </Card>
          )}
        </Box>
      </Box>
  );
};

export default LandValueExplorer;