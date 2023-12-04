import { useEffect, useMemo, useRef } from 'react';
import { BufferAttribute, DoubleSide, Vector3 } from 'three';

type InputPlanePlaneProps = JSX.IntrinsicElements['mesh'] & {
  inputData: number[];
  inputSize: number;
  inputRowSize: number;
  inputColSize: number;
  inputPlane: { size: number; space: number };
  inputPos: Vector3;
};

function getInputGeometryArray(
  inputData: number[],
  inputSize: number,
  inputRowSize: number,
  inputColSize: number,
  inputPlane: { size: number; space: number },
  inputPos: Vector3,
): {
  position: Float32Array;
  color: Float32Array;
  index: Uint16Array;
} {
  const inputGapSize = inputPlane.size + inputPlane.space;
  const inputHalfSideSize = inputPlane.size / 2;

  const position = new Float32Array(inputSize * 4 * 3);
  const color = new Float32Array(inputSize * 4 * 3);
  const index = new Uint16Array(inputSize * 6);

  let positionIndex = 0;
  let colorIndex = 0;
  let indexIndex = 0;

  const startX = inputPos.x - (inputGapSize * (inputRowSize - 1)) / 2;
  const startY = inputPos.y + (inputGapSize * (inputColSize - 1)) / 2;
  const startZ = inputPos.z;

  for (let col = 0; col < inputColSize; col++) {
    for (let row = 0; row < inputRowSize; row++) {
      const x = startX + row * inputGapSize;
      const y = startY - col * inputGapSize;
      const z = startZ;

      const colorValue = inputData[inputRowSize + col * inputColSize + row];

      position[positionIndex] = x - inputHalfSideSize;
      position[positionIndex + 1] = y - inputHalfSideSize;
      position[positionIndex + 2] = z;
      position[positionIndex + 3] = x - inputHalfSideSize;
      position[positionIndex + 4] = y + inputHalfSideSize;
      position[positionIndex + 5] = z;
      position[positionIndex + 6] = x + inputHalfSideSize;
      position[positionIndex + 7] = y + inputHalfSideSize;
      position[positionIndex + 8] = z;
      position[positionIndex + 9] = x + inputHalfSideSize;
      position[positionIndex + 10] = y - inputHalfSideSize;
      position[positionIndex + 11] = z;

      for (let i = 0; i < 4; i++) {
        color[colorIndex + 3 * i] = colorValue;
        color[colorIndex + 3 * i + 1] = colorValue;
        color[colorIndex + 3 * i + 2] = colorValue;
      }

      const indexValue = 4 * (row + col * inputRowSize);
      index[indexIndex] = indexValue;
      index[indexIndex + 1] = indexValue + 1;
      index[indexIndex + 2] = indexValue + 2;
      index[indexIndex + 3] = indexValue + 2;
      index[indexIndex + 4] = indexValue + 3;
      index[indexIndex + 5] = indexValue;

      positionIndex += 12;
      colorIndex += 12;
      indexIndex += 6;
    }
  }

  return { position, color, index };
}

export function InputHiddenPlane(props: InputPlanePlaneProps) {
  const inputColorBufferAttribute = useRef<BufferAttribute | null>(null);

  const getInputGeometryArrayResult = useMemo(
    () =>
      getInputGeometryArray(
        props.inputData,
        props.inputSize,
        props.inputRowSize,
        props.inputColSize,
        props.inputPlane,
        props.inputPos,
      ),
    [],
  );

  useEffect(() => {
    if (inputColorBufferAttribute.current) {
      // update color
      const colorArray = inputColorBufferAttribute.current
        .array as Float32Array;
      for (let i = 0; i < props.inputData.length; i++) {
        const colorArrayIndex = i * 4 * 3;
        for (let j = 0; j < 4 * 3; j++) {
          colorArray[colorArrayIndex + j] = props.inputData[i];
        }
      }

      inputColorBufferAttribute.current.needsUpdate = true;
    }
  }, [props.inputData]);

  return (
    <mesh {...props}>
      <bufferGeometry>
        <bufferAttribute
          attach={'attributes-position'}
          count={getInputGeometryArrayResult.position.length / 3}
          array={getInputGeometryArrayResult.position}
          itemSize={3}
        />
        <bufferAttribute
          attach={'attributes-color'}
          ref={inputColorBufferAttribute}
          count={getInputGeometryArrayResult.color.length / 3}
          array={getInputGeometryArrayResult.color}
          itemSize={3}
        />
        <bufferAttribute
          attach={'index'}
          count={getInputGeometryArrayResult.index.length / 1}
          array={getInputGeometryArrayResult.index}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        side={DoubleSide}
        vertexShader={`
        attribute vec3 color;

        varying vec3 vColor;

        void main() {
          vColor = color;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
          `}
        fragmentShader={`
        varying vec3 vColor;

        void main() {
          gl_FragColor = vec4(vColor, 1.0);
        }
          `}
      />
    </mesh>
  );
}
