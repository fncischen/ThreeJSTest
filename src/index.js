import * as THREE from 'three'
import ReactDOM from 'react-dom'
import React, { useCallback, useEffect, useRef, useMemo } from 'react'

function App() {
    const mouse = useRef([0, 0])
    const onMouseMove = useCallback(({ clientX: x, clientY: y }) => (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]), [])
    return (
      <div style={{ width: '100%', height: '100%' }} onMouseMove={onMouseMove}>
        <Canvas camera={{ fov: 75, position: [0, 0, 70] }}>
          <pointLight distance={60} intensity={2} color="white" />
          <spotLight intensity={0.5} position={[0, 0, 70]} penumbra={1} color="lightblue" />
          <mesh>
            <planeBufferGeometry attach="geometry" args={[10000, 10000]} />
            <meshPhongMaterial attach="material" color="#272727" depthTest={false} />
          </mesh>
          <Swarm mouse={mouse} count={20000} />
          <Effect />
          <Dolly />
        </Canvas>
      </div>
    )
  }
  
  ReactDOM.render(<App />, document.getElementById('root'))