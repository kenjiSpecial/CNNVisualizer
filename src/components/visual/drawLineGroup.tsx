import { useMemo, useRef } from 'react';
import { BufferGeometry, MathUtils, Vector3 } from 'three';

type DrawLineGroupProps = {
  inputData: number[];
  inputPlane: {
    size: number;
    space: number;
  };
  inputPos: Vector3;
  inputSize: number;
  inputRowSize: number;
  inputColSize: number;
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
  resultData: number[] | undefined;
  resultPlane: {
    size: number;
    space: number;
    num: number;
    row: number;
    col: number;
  };
  resultPos: Vector3;
};

export function DrawLineGroup(props: DrawLineGroupProps) {
  const {
    inputData,
    inputPlane,
    inputPos,
    inputRowSize,
    inputColSize,
    poolingData,
    poolingPlane,
    poolingPos,
    hiddenData,
    hiddenPlane,
    hiddenPos,
    resultData,
    resultPlane,
    resultPos,
  } = props;
  const geometry = useRef<BufferGeometry>(null!);
  const poolingNumPerUnit = 60;
  const inputNum = 5000;

  // input -> poolingの線を引く。
  // inputNum個のobjectを作成し、arrayに入れる。
  // objectは inputRow 0 - inputRowSize - 1, inputCol 0 - inputColSize の乱数と
  // divide: {
  //   row: MathUtils.randInt(0, poolingPlane.divide - 1),
  //   col: MathUtils.randInt(0, poolingPlane.divide - 1),
  // },
  // main: {
  //   row: MathUtils.randInt(0, poolingPlane.row - 1),
  //   col: MathUtils.randInt(0, poolingPlane.col - 1),
  // },
  // の乱数の2つを持つ。
  // useMemoを使って、キャッシュする。
  const inputPairArr = useMemo(() => {
    const arr = [];
    for (let i = 0; i < inputNum; i++) {
      arr.push({
        input: {
          row: MathUtils.randInt(0, inputRowSize - 1),
          col: MathUtils.randInt(0, inputColSize - 1),
        },
        pooling: {
          divide: {
            row: MathUtils.randInt(0, poolingPlane.divide - 1),
            col: MathUtils.randInt(0, poolingPlane.divide - 1),
          },
          main: {
            row: MathUtils.randInt(0, poolingPlane.row - 1),
            col: MathUtils.randInt(0, poolingPlane.col - 1),
          },
        },
      });
    }
    return arr;
  }, []);

  // 0 - hiddenPlane.num - 1 に対して それおぞれ poolingNumPerUnit 個のobjectを作成する。
  // objectは 0 - poolingPlane.num - 1 の乱数、 0 - poolingPlane.divide - 1 の乱数、 0 - 1 の乱数を2つ持つ。
  // useMemoを使って、キャッシュする。
  const poolingInputPairArr = useMemo(() => {
    const arr = [];
    // for (let i = 0; i < poolingHiddenNumber; i++) {
    //   arr.push(MathUtils.(0, 1));
    // }
    for (let i = 0; i < hiddenPlane.num; i++) {
      // arr.push(MathUtils.randFloat(0, 1));
      const rowArr = [];
      for (let j = 0; j < poolingNumPerUnit; j++) {
        // rowArr.push(MathUtils.randFloat(0, 1));
        rowArr.push({
          divide: {
            row: MathUtils.randInt(0, poolingPlane.divide - 1),
            col: MathUtils.randInt(0, poolingPlane.divide - 1),
          },
          main: {
            row: MathUtils.randInt(0, poolingPlane.row - 1),
            col: MathUtils.randInt(0, poolingPlane.col - 1),
          },
        });
      }
      arr.push(rowArr);
    }

    return arr;
  }, []);

  const pos = useMemo(() => {
    const arr = [];

    // input -> poolingの線を引く。
    for (let i = 0; i < inputNum; i++) {
      const inputObj = inputPairArr[i];
      const inputPosX =
        inputPos.x +
        (inputObj.input.col - (inputColSize - 1) / 2) *
          (inputPlane.size + inputPlane.space);
      const inputPosY =
        inputPos.y -
        (inputObj.input.row - (inputRowSize - 1) / 2) *
          (inputPlane.size + inputPlane.space);
      const inputPosZ = inputPos.z;
      const poolingObj = inputObj.pooling;
      const poolGridSize = poolingPlane.size / poolingPlane.divide;
      const poolingPosX =
        poolingPos.x +
        (poolingObj.main.col - (poolingPlane.col - 1) / 2) *
          (poolingPlane.size + poolingPlane.space) +
        (poolingObj.divide.col - (poolingPlane.divide - 1) / 2) * poolGridSize +
        poolGridSize * MathUtils.randFloat(-0.5, 0.5);

      const poolingPosY =
        poolingPos.y -
        (poolingObj.main.row - (poolingPlane.row - 1) / 2) *
          (poolingPlane.size + poolingPlane.space) -
        (poolingObj.divide.row - (poolingPlane.divide - 1) / 2) * poolGridSize +
        poolGridSize * MathUtils.randFloat(-0.5, 0.5);

      const poolingPosZ = poolingPos.z;
      arr.push(
        inputPosX + inputPlane.size * MathUtils.randFloat(-0.5, 0.5),
        inputPosY + inputPlane.size * MathUtils.randFloat(-0.5, 0.5),
        inputPosZ,
        poolingPosX,
        poolingPosY,
        poolingPosZ,
      );
    }

    // pooling -> hiddenの線を引く。
    for (let hiddenRow = 0; hiddenRow < hiddenPlane.row; hiddenRow++) {
      for (let hiddenCol = 0; hiddenCol < hiddenPlane.col; hiddenCol++) {
        const hiddenIndex = hiddenRow * hiddenPlane.row + hiddenCol;
        const hiddenPosX =
          hiddenPos.x +
          (hiddenCol - (hiddenPlane.col - 1) / 2) *
            (hiddenPlane.size + hiddenPlane.space);
        const hiddenPosY =
          hiddenPos.y +
          (hiddenRow - (hiddenPlane.row - 1) / 2) *
            (hiddenPlane.size + hiddenPlane.space);
        const hiddenPosZ = hiddenPos.z;
        for (
          let poolingIndex = 0;
          poolingIndex < poolingNumPerUnit;
          poolingIndex++
        ) {
          const poolingObj = poolingInputPairArr[hiddenIndex][poolingIndex];
          const poolGridSize = poolingPlane.size / poolingPlane.divide;
          const poolingPosX =
            poolingPos.x +
            (poolingObj.main.col - (poolingPlane.col - 1) / 2) *
              (poolingPlane.size + poolingPlane.space) +
            (poolingObj.divide.col - (poolingPlane.divide - 1) / 2) *
              poolGridSize +
            poolGridSize * MathUtils.randFloat(-0.5, 0.5);

          const poolingPosY =
            poolingPos.y -
            (poolingObj.main.row - (poolingPlane.row - 1) / 2) *
              (poolingPlane.size + poolingPlane.space) -
            (poolingObj.divide.row - (poolingPlane.divide - 1) / 2) *
              poolGridSize +
            poolGridSize * MathUtils.randFloat(-0.5, 0.5);

          const poolingPosZ = poolingPos.z;
          arr.push(
            hiddenPosX + hiddenPlane.size * MathUtils.randFloat(-0.5, 0.5),
            hiddenPosY + hiddenPlane.size * MathUtils.randFloat(-0.5, 0.5),
            hiddenPosZ,
            poolingPosX,
            poolingPosY,
            poolingPosZ,
          );
        }
      }
    }

    // hidden -> outputの線を引く。
    for (let outputIndex = 0; outputIndex < resultPlane.num; outputIndex++) {
      const theta = (outputIndex * Math.PI) / 5 - Math.PI / 2;
      const rad = 8;
      const x = Math.cos(theta) * rad;
      const y = -Math.sin(theta) * rad;
      const outputPosX = resultPos.x + x;
      const outputPosY = resultPos.y + y;
      const outputPosZ = resultPos.z;
      for (let hiddenIndex = 0; hiddenIndex < hiddenPlane.num; hiddenIndex++) {
        const hiddenRow = Math.floor(hiddenIndex / hiddenPlane.row);
        const hiddenCol = hiddenIndex % hiddenPlane.row;
        const hiddenPosX =
          hiddenPos.x +
          (hiddenCol - (hiddenPlane.col - 1) / 2) *
            (hiddenPlane.size + hiddenPlane.space) +
          hiddenPlane.size * MathUtils.randFloat(-0.5, 0.5);
        const hiddenPosY =
          hiddenPos.y -
          (hiddenRow - (hiddenPlane.row - 1) / 2) *
            (hiddenPlane.size + hiddenPlane.space) +
          hiddenPlane.size * MathUtils.randFloat(-0.5, 0.5);
        const hiddenPosZ = hiddenPos.z + 0.1;
        arr.push(
          hiddenPosX,
          hiddenPosY,
          hiddenPosZ,
          outputPosX + 0.1 * MathUtils.randFloat(-1, 1),
          outputPosY + 0.1 * MathUtils.randFloat(-1, 1),
          outputPosZ,
        );
      }
    }

    if (geometry.current) {
      geometry.current.attributes.position.needsUpdate = true;
    }
    return new Float32Array(arr);
  }, []);

  const color = useMemo(() => {
    const colors = [];
    // input -> poolingのvalueを色として配列に入れる。
    for (let i = 0; i < inputNum; i++) {
      const inputObj = inputPairArr[i];
      const inputIndex = inputObj.input.row * inputRowSize + inputObj.input.col;
      const inputValue = inputData ? inputData[inputIndex] : 0;
      const inputColorVal = inputValue;
      const inputAlphaVal = Math.max(inputValue * 0.5, 0.01);
      const poolingObj = inputObj.pooling;
      const poolingIndex =
        inputObj.pooling.main.row * poolingPlane.col +
        inputObj.pooling.main.col;

      const poolingColorVal = poolingData
        ? poolingData[0][poolingIndex][poolingObj.divide.row][
            poolingObj.divide.col
          ]
        : 0;
      const poolingAlphaVal = Math.max(poolingColorVal * 0.4, 0.01);
      colors.push(
        inputColorVal,
        inputColorVal,
        inputColorVal,
        inputAlphaVal,
        poolingColorVal,
        poolingColorVal,
        poolingColorVal,
        poolingAlphaVal,
      );
    }

    // pooling -> hiddenのvalueを色として配列に入れる。
    for (let hiddenRow = 0; hiddenRow < hiddenPlane.row; hiddenRow++) {
      for (let hiddenCol = 0; hiddenCol < hiddenPlane.col; hiddenCol++) {
        const hiddenIndex = hiddenRow * hiddenPlane.row + hiddenCol;
        const hiddenValue = hiddenData ? hiddenData[0][hiddenIndex] : 0;
        const hiddenColorVal = hiddenValue;
        const hiddenAlphaVal = hiddenValue * 0.1;
        for (
          let poolingIndex = 0;
          poolingIndex < poolingNumPerUnit;
          poolingIndex++
        ) {
          const poolObj = poolingInputPairArr[hiddenIndex][poolingIndex];
          // const poolObj2 = poolObj[poolingIndex];
          const index = poolObj.main.row * poolingPlane.col + poolObj.main.col;
          const poolingColorVal = poolingData
            ? poolingData[0][index][poolObj.divide.row][poolObj.divide.col]
            : 0;
          const poolingAlphaVal = poolingColorVal * 0.1;
          colors.push(
            hiddenColorVal,
            hiddenColorVal,
            hiddenColorVal,
            hiddenAlphaVal,
            poolingColorVal,
            poolingColorVal,
            poolingColorVal,
            poolingAlphaVal,
          );
        }
      }
    }

    // hidden -> outputのvalueを色として配列に入れる。
    for (let outputIndex = 0; outputIndex < resultPlane.num; outputIndex++) {
      const outputValue = resultData ? resultData[outputIndex] : 0;
      const outputColorVal = outputValue;
      const outputAlphaVal = outputValue * 0.1;
      for (let hiddenIndex = 0; hiddenIndex < hiddenPlane.num; hiddenIndex++) {
        const hiddenColorVal = hiddenData ? hiddenData[0][hiddenIndex] : 0;
        const hiddenAlphaVal = hiddenColorVal * 0.1;
        colors.push(
          hiddenColorVal,
          hiddenColorVal,
          hiddenColorVal,
          hiddenAlphaVal,
          outputColorVal,
          outputColorVal,
          outputColorVal,
          outputAlphaVal,
        );
      }
    }

    if (geometry.current) {
      geometry.current.attributes.color.needsUpdate = true;
    }
    return new Float32Array(colors);
  }, [inputData, poolingData, hiddenData, resultData]);

  return (
    <lineSegments>
      <bufferGeometry ref={geometry}>
        <bufferAttribute
          attach={'attributes-position'}
          count={pos.length / 3}
          itemSize={3}
          array={pos}
        />
        <bufferAttribute
          attach={'attributes-color'}
          count={color.length / 4}
          itemSize={4}
          array={color}
        />
      </bufferGeometry>
      <lineBasicMaterial
        attach="material"
        vertexColors={true}
        linewidth={0.1}
        transparent={true}
        depthWrite={false}
        depthTest={true}
      />
    </lineSegments>
  );
}
