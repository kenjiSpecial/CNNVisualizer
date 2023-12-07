import { useEffect, useMemo, useRef } from 'react';
import { BufferAttribute, DoubleSide, Vector3 } from 'three';

type InputPlanePlaneProps = JSX.IntrinsicElements['group'] & {
  inputData: number[];
  inputSize: number;
  inputRowSize: number;
  inputColSize: number;
  inputPlane: { size: number; space: number };
  inputPos: Vector3;
  covolutionData: number[][][][] | undefined;
  covolutionPlane: {
    size: number;
    space: number;
    divide: number;
    num: number;
    row: number;
    col: number;
  };
  covolutionPos: Vector3;
  poolingData: number[][][][] | undefined;
  poolingPlane: {
    size: number;
    space: number;
    divide: number;
    num: number;
    row: number;
    col: number;
  };
  poolingPos: Vector3;
  hiddenData: number[][] | undefined;
  hiddenPlane: {
    size: number;
    space: number;
    num: number;
    row: number;
    col: number;
  };
  hiddenPos: Vector3;
};

export function InputHiddenPlane(props: InputPlanePlaneProps) {
  const inputColorBufferAttribute = useRef<BufferAttribute | null>(null);
  const poolingColorBufferAttribute = useRef<BufferAttribute | null>(null);
  const hiddenColorBufferAttribute = useRef<BufferAttribute | null>(null);

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

  // poolingDataSigmoidを使ってgetPoolingGeometryArrayを呼び出す
  const getPoolingGeometryArrayResult = useMemo(
    () =>
      getPoolingGeometryArray(
        props.poolingData,
        props.poolingPlane,
        props.poolingPos,
      ),
    [],
  );

  // useEffectでpoolingColorBufferAttributeを更新
  useEffect(() => {
    if (poolingColorBufferAttribute.current && props.poolingData) {
      // update color
      const colorArray = poolingColorBufferAttribute.current
        .array as Float32Array;

      const channel = props.poolingData[0].length;
      const row = props.poolingData[0][0].length;
      const col = props.poolingData[0][0][0].length;
      for (let c = 0; c < channel; c++) {
        for (let r = 0; r < row; r++) {
          for (let l = 0; l < col; l++) {
            const colorArrayIndex =
              c * row * col * 4 * 3 + r * col * 4 * 3 + l * 4 * 3;
            for (let i = 0; i < 4 * 3; i++) {
              colorArray[colorArrayIndex + i] = props.poolingData[0][c][r][l];
            }
          }
        }
      }

      poolingColorBufferAttribute.current.needsUpdate = true;
    }
  }, [props.poolingData]);

  // hiddenDataSigmoidを使ってgetHiddenGeometryArrayを呼び出す
  const getHiddenGeometryArrayResult = useMemo(
    () =>
      getInputGeometryArray(
        props.hiddenData ? props.hiddenData[0] : undefined,
        props.hiddenPlane.num,
        props.hiddenPlane.row,
        props.hiddenPlane.col,
        props.hiddenPlane,
        props.hiddenPos,
      ),
    [],
  );

  useEffect(() => {
    if (
      hiddenColorBufferAttribute.current &&
      props.hiddenData &&
      props.hiddenData[0]
    ) {
      // update color
      const colorArray = hiddenColorBufferAttribute.current
        .array as Float32Array;
      for (let i = 0; i < props.hiddenData[0].length; i++) {
        const colorArrayIndex = i * 4 * 3;
        for (let j = 0; j < 4 * 3; j++) {
          colorArray[colorArrayIndex + j] = props.hiddenData[0][i]
            ? props.hiddenData[0][i]
            : 0;
        }
      }

      hiddenColorBufferAttribute.current.needsUpdate = true;
    }
  }, [props.hiddenData]);

  // line segments用のdataを作成
  //

  const mat = useMemo(
    () => (
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
    ),
    [],
  );

  return (
    <group {...props}>
      <mesh>
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
        {mat}
      </mesh>
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach={'attributes-position'}
            count={getPoolingGeometryArrayResult.position.length / 3}
            array={getPoolingGeometryArrayResult.position}
            itemSize={3}
          />
          <bufferAttribute
            attach={'attributes-color'}
            ref={poolingColorBufferAttribute}
            count={getPoolingGeometryArrayResult.color.length / 3}
            array={getPoolingGeometryArrayResult.color}
            itemSize={3}
          />
          <bufferAttribute
            attach={'index'}
            count={getPoolingGeometryArrayResult.index.length / 1}
            array={getPoolingGeometryArrayResult.index}
            itemSize={1}
          />
        </bufferGeometry>
        {mat}
      </mesh>
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach={'attributes-position'}
            count={getHiddenGeometryArrayResult.position.length / 3}
            array={getHiddenGeometryArrayResult.position}
            itemSize={3}
          />
          <bufferAttribute
            attach={'attributes-color'}
            ref={hiddenColorBufferAttribute}
            count={getHiddenGeometryArrayResult.color.length / 3}
            array={getHiddenGeometryArrayResult.color}
            itemSize={3}
          />
          <bufferAttribute
            attach={'index'}
            count={getHiddenGeometryArrayResult.index.length / 1}
            array={getHiddenGeometryArrayResult.index}
            itemSize={1}
          />
        </bufferGeometry>
        {mat}
      </mesh>
    </group>
  );
}

function getInputGeometryArray(
  inputData: number[] | undefined,
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

      const colorValue =
        inputData && inputData[inputRowSize + col * inputColSize + row]
          ? inputData[inputRowSize + col * inputColSize + row]
          : 0;

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

function getPoolingGeometryArray(
  poolingDataSigmoid: number[][][][] | undefined,
  poolingPlane: {
    size: number;
    space: number;
    divide: number;
    num: number;
    row: number;
    col: number;
  },
  poolingPos: Vector3,
) {
  // Your code here
  // poolingDataSigmoidがundefinedの場合はreturn undefined
  // if (!poolingDataSigmoid) return undefined;

  // position, color, indexの配列を作成
  const poolingSize = poolingPlane.size;
  const divide = poolingPlane.divide;
  const gridSize = poolingSize / poolingPlane.divide;
  const space = poolingPlane.space;
  const planeNum = poolingPlane.num;
  const row = poolingPlane.row;
  const col = poolingPlane.col;

  // position, color, indexの配列を作成
  const position = new Float32Array(planeNum * divide * divide * 4 * 3);
  const color = new Float32Array(planeNum * divide * divide * 4 * 3);
  const index = new Uint16Array(planeNum * divide * divide * 6);

  let positionIndex = 0;
  let colorIndex = 0;
  let indexIndex = 0;
  // for文を使ってposition, color, indexの配列を作成
  // for row ->  for col -> for gridY -> for gridX
  for (let r = 0; r < row; r++) {
    for (let c = 0; c < col; c++) {
      for (let gridY = 0; gridY < divide; gridY++) {
        for (let gridX = 0; gridX < divide; gridX++) {
          // Your code here
          const x =
            poolingPos.x +
            (poolingSize + space) * c +
            gridSize * gridX -
            ((poolingSize + space) * (col - 1)) / 2 -
            (gridSize * (divide - 1)) / 2;

          const y =
            poolingPos.y -
            (poolingSize + space) * r -
            gridSize * gridY +
            ((poolingSize + space) * (row - 1)) / 2 +
            (gridSize * (divide - 1)) / 2;

          const z = poolingPos.z;

          // poolingDataSigmoidからcolorを取得 (poolingDataSigmoid[0][filterNum][gridY][gridX])
          const colorValue = poolingDataSigmoid
            ? poolingDataSigmoid[0][r * col + c][gridY][gridX]
            : 0;

          // indexの値を計算
          const indexValue =
            4 *
            (r * col * divide * divide +
              c * divide * divide +
              gridY * divide +
              gridX);

          // position, color, indexの配列に値を代入
          const rate = 0.7;
          position[positionIndex] = x - (gridSize / 2) * rate;
          position[positionIndex + 1] = y - (gridSize / 2) * rate;
          position[positionIndex + 2] = z;
          position[positionIndex + 3] = x - (gridSize / 2) * rate;
          position[positionIndex + 4] = y + (gridSize / 2) * rate;
          position[positionIndex + 5] = z;
          position[positionIndex + 6] = x + (gridSize / 2) * rate;
          position[positionIndex + 7] = y + (gridSize / 2) * rate;
          position[positionIndex + 8] = z;
          position[positionIndex + 9] = x + (gridSize / 2) * rate;
          position[positionIndex + 10] = y - (gridSize / 2) * rate;
          position[positionIndex + 11] = z;

          for (let i = 0; i < 4; i++) {
            color[colorIndex + 3 * i] = colorValue;
            color[colorIndex + 3 * i + 1] = colorValue;
            color[colorIndex + 3 * i + 2] = colorValue;
          }

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
    }
  }

  return { position, color, index };
}
