import React, { useState, Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  IconButton,
  Drawer,
  Grid,
} from "@mui/material";
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

// Simple House component with aligned roof
const House = ({ position }) => {
  const meshRef = useRef();

  return (
    <group position={position}>
      {/* Main body of house */}
      <mesh position={[0, 0.3, 0]} ref={meshRef}>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      {/* Aligned roof */}
      <mesh position={[0, 0.7, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.6, 0.4, 4]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
};

// Scene setup component
const Scene = ({ children }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      {children}
    </>
  );
};

// Generate grid plots
const generateGridPlots = () => {
  const plots = [];
  const gridSize = 15;
  const plotSize = 2;
  const startOffset = -(gridSize * plotSize) / 2 + plotSize / 2;
  const middleRow = Math.floor(gridSize / 2);

  let plotId = 0;
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = startOffset + col * plotSize;
      const z = startOffset + row * plotSize;

      const isRoad = row === middleRow;
      const isNextToRoad = row === middleRow - 1 || row === middleRow + 1;

      const hexId = Math.random().toString(16).substr(2, 6).toUpperCase();
      plots.push({
        id: plotId++,
        hexId: `0x${hexId}`,
        position: [x, 0, z],
        rotation: [0, 0, 0],
        scale: [plotSize, 0.1, plotSize],
        value: Math.floor(Math.random() * 500000) + 100000,
        zoning: ['residential', 'commercial', 'mixed-use'][Math.floor(Math.random() * 3)],
        transitScore: Math.floor(Math.random() * 100),
        infrastructureScore: Math.floor(Math.random() * 100),
        lastSale: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        isRoad,
        isNextToRoad
      });
    }
  }
  return plots;
};

// Styled components
const ViewportCard = styled(Card)(({ isFullscreen }) => ({
  width: '100%',
  height: isFullscreen ? '100vh' : '600px',
  display: 'flex',
  flexDirection: 'column',
  position: isFullscreen ? 'fixed' : 'relative',
  top: isFullscreen ? 0 : 'auto',
  left: isFullscreen ? 0 : 'auto',
  right: isFullscreen ? 0 : 'auto',
  bottom: isFullscreen ? 0 : 'auto',
  zIndex: isFullscreen ? 1300 : 1,
}));

const CanvasContainer = styled(Box)({
  flex: 1,
  position: 'relative',
  backgroundColor: '#f1f5f9',
  borderRadius: '8px',
  overflow: 'hidden'
});

// Grid Plot component
const GridPlot = ({ position, scale, rotation, hexId, isSelected, onClick, isRoad, isNextToRoad }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh ref={meshRef}>
        <boxGeometry args={scale} />
        <meshStandardMaterial
          color={isSelected ? '#3b82f6' : isRoad ? '#e2e8f0' : hovered ? '#94a3b8' : '#64748b'}
        />
      </mesh>

      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...scale)]} />
        <lineBasicMaterial color="black" />
      </lineSegments>

      {isNextToRoad && (
        <House position={[0, 0, 0]} />
      )}

      {hovered && (
        <Html position={[0, scale[1] + 0.5, 0]} center>
          <div style={{
            background: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}>
            {hexId}
          </div>
        </Html>
      )}
    </group>
  );
};

// Grid Lines
const GridLines = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[32, 32]} />
      <meshStandardMaterial color="#94a3b8" wireframe />
    </mesh>
    <gridHelper args={[32, 32, '#cbd5e1', '#cbd5e1']} position={[0, -0.04, 0]} />
  </group>
);

// Main component
const LandValueExplorer = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const plotData = React.useMemo(() => generateGridPlots(), []);

  return (
    <ViewportCard isFullscreen={isFullscreen}>
      <CardHeader
        title="Land Value Grid Explorer"
        action={
          <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        }
      />

      <CardContent sx={{ flex: 1, display: 'flex', gap: 2, p: 2 }}>
        <CanvasContainer>
          <Canvas
            camera={{ position: [25, 25, 25], fov: 50 }}
            gl={{ preserveDrawingBuffer: true }}
            shadows
          >
            <Suspense fallback={null}>
              <Scene>
                <GridLines />
                {plotData.map((plot) => (
                  <GridPlot
                    key={plot.id}
                    {...plot}
                    isSelected={selectedPlot?.id === plot.id}
                    onClick={() => setSelectedPlot(plot)}
                  />
                ))}
              </Scene>
              <OrbitControls makeDefault />
            </Suspense>
          </Canvas>
        </CanvasContainer>
      </CardContent>

      <Drawer
        anchor="right"
        open={Boolean(selectedPlot)}
        onClose={() => setSelectedPlot(null)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 340,
            p: 3,
          },
        }}
      >
        {selectedPlot && (
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={() => setSelectedPlot(null)}
              sx={{ position: 'absolute', right: -12, top: -12 }}
            >
              <CloseIcon />
            </IconButton>

            <Typography variant="h6" gutterBottom>
              Plot {selectedPlot.hexId}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Chip
                  label={selectedPlot.isRoad ? 'Road' : selectedPlot.zoning}
                  color="primary"
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Value
                </Typography>
                <Typography variant="h6">
                  ${selectedPlot.value.toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Transit Score
                </Typography>
                <Typography>
                  {selectedPlot.transitScore}/100
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Infrastructure
                </Typography>
                <Typography>
                  {selectedPlot.infrastructureScore}/100
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Sale
                </Typography>
                <Typography>
                  {selectedPlot.lastSale}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Grid Position
                </Typography>
                <Typography>
                  X: {(selectedPlot.position[0] / 2 + 7).toFixed(0)},
                  Y: {(selectedPlot.position[2] / 2 + 7).toFixed(0)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Drawer>
    </ViewportCard>
  );
};

export default LandValueExplorer;



const Sidebar = ({ isOpen, onClose, selectedPlot }) => {
  return (
    <Drawer anchor="left" open={isOpen} onClose={onClose}>
      <Box sx={{ width: 300, p: 2, backgroundColor: "#f4f4f4", height: "100%" }}>
        <IconButton onClick={onClose} sx={{ float: "right" }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ color: "#039303", fontWeight: "bold", mb: 2 }}>
          Land Valuation Details
        </Typography>
        {selectedPlot ? (
          <Box>
            <Typography variant="body1"><strong>Location:</strong> {selectedPlot.location}</Typography>
            <Typography variant="body1"><strong>Value:</strong> {selectedPlot.value}</Typography>
            <Typography variant="body1"><strong>Zone:</strong> {selectedPlot.zone}</Typography>
            <Chip label={`Tax: ${selectedPlot.tax}`} color="primary" sx={{ mt: 2 }} />
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: "#666" }}>Select a plot to view details.</Typography>
        )}
      </Box>
    </Drawer>
  );
};
