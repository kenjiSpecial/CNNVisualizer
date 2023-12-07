// 数字をスライドすることができる
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { ministSampleData } from './components/visual/mnist-sample';
import { useWindowSize } from './components/visual/use-window-size';
import { InputHiddenPlane } from './components/visual/input-hidden-plane';
import {
  useCovolutionMemo,
  usePoolingMemo,
} from './components/neuralnet/covolution';
import {
  calcAffine,
  calcRelu2DArray,
  reshapeArray,
} from './components/neuralnet/functions';
import Sidebar from './components/ui/sidebar';
import { ResultMesh } from './components/visual/result-mesh';
import { DrawLineGroup } from './components/visual/drawLineGroup';

function App() {
  const autoNumCntRef = useRef(
    Math.floor(Math.random() * ministSampleData.length),
  );
  const isButtonClicked = useRef(false);

  const [inputData, setInputData] = useState<number[]>(
    ministSampleData[autoNumCntRef.current],
  );
  const windowSize = useWindowSize();

  const inputSize = 28 * 28;
  const inputRowSize = 28;
  const inputColSize = 28;

  // covolutionのパラメータ
  const filterNum = 30;
  const filterRowSize = 5;
  const filterColSize = 5;
  const covolutionStride = 1;
  const covolutionPadding = 0;

  const inputPlane = { size: 1 / 10, space: 0.02 }; // const size = 1 / 14       const space = 0.02;
  const covolutionPlane = {
    size: 1.2,
    space: 0.1,
    divide: 24,
    num: 30,
    row: 5,
    col: 6,
  };
  const poolingPlane = {
    size: 1.8,
    space: 0.2,
    divide: 12,
    num: 30,
    row: 6,
    col: 5,
  };
  const hiddenPlane = {
    size: 0.4,
    space: 0.15,
    num: 100,
    row: 10,
    col: 10,
  };
  const outputPlane = {
    size: 0.3,
    space: 0.1,
    num: 10,
    row: 2,
    col: 5,
  };

  const inputPos = new Vector3(0, 0, 0);
  const covolutionPos = new Vector3(0, 0, -0.5);
  const poolingPos = new Vector3(0, 0, -0.5);
  const hiddenPos = new Vector3(0, 0, -8);
  const outputPos = new Vector3(0, 0, -16);

  const [params, setParams] = useState<{
    W1: number[][][][];
    b1: number[];
    W2: number[][];
    b2: number[];
    W3: number[][];
    b3: number[];
  } | null>(null);

  // useCovolution + Relu
  const covolutionData = useCovolutionMemo(
    [[inputData]],
    params?.W1,
    params?.b1,
    inputRowSize,
    inputColSize,
    filterNum,
    filterRowSize,
    filterColSize,
    covolutionPadding,
    covolutionStride,
  );
  const poolingData = usePoolingMemo(covolutionData, 2, 2, 2, 0);
  const hiddenData = useMemo(() => {
    if (!poolingData || !params?.W2 || !params?.b2) return undefined;
    const res = reshapeArray(poolingData);
    return calcAffine(res, params?.W2, params?.b2);
  }, [poolingData, params?.W2, params?.b2]);
  const outputData = useMemo(() => {
    if (!hiddenData || !params?.W3 || !params?.b3) return undefined;
    const res = calcRelu2DArray(hiddenData);
    return calcAffine(res, params?.W3, params?.b3);
  }, [hiddenData, params?.W3, params?.b3]);

  // result用に使用するデータ
  // resultMeshに渡すために、softmax関数をかけた結果の配列を作成する。
  const outputSoftmaxArr = useMemo(() => {
    if (outputData === undefined) {
      return undefined;
    }
    const result = outputData[0];
    const max = Math.max(...result);
    const exp = result.map((x) => Math.exp(x - max));
    const sumExp = exp.reduce((a, b) => a + b);
    return exp.map((x) => x / sumExp);
  }, [outputData]);

  // poolingDataをsigmoidに変換
  // useMemoでキャッシュ
  const poolingDataSigmoid = useMemo(() => {
    if (!poolingData) return undefined;

    const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

    const result = poolingData.map((data) =>
      data.map((data) =>
        data.map((data) => data.map((data) => sigmoid(data) * 2 - 1)),
      ),
    );

    return result;
  }, [poolingData]);

  // hiddenDataをsigmoidに変換
  // useMemoでキャッシュ
  const hiddenDataSigmoid = useMemo(() => {
    if (!hiddenData) return undefined;

    const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

    const result = hiddenData.map((data) => data.map((data) => sigmoid(data)));

    return result;
  }, [hiddenData]);

  const isLoading = useMemo(() => {
    return params === null;
  }, [params]);
  const displayLoading = useMemo(() => {
    return isLoading ? 'block' : 'hidden';
  }, [isLoading]);
  const displayCanvas = useMemo(() => {
    return isLoading ? 'hidden' : 'block';
  }, [isLoading]);
  const displaySideBar = useMemo(() => {
    return isLoading ? 'hidden' : 'flex';
  }, [isLoading]);

  useEffect(() => {
    fetch('/cnn-params.json')
      .then((res) => res.json())
      .then((data) => {
        setParams(data);
      });
  }, []);

  const clickButton = useCallback(() => {
    autoNumCntRef.current = Math.floor(Math.random() * ministSampleData.length);
    isButtonClicked.current = true;
    setInputData(ministSampleData[autoNumCntRef.current]);
  }, []);

  return (
    <>
      <div
        className="h-screen  w-screen bg-gradient-to-t from-slate-900 to-blue-900 block cursor-grab "
        id="canvas"
      >
        <div className={`${displayCanvas} w-full h-2/3 sm:h-screen`}>
          <Canvas camera={{ position: [15, 1, 12] }}>
            <ambientLight />
            <pointLight position={[5, 5, 5]} />s
            <group position={[0, 0, 8]}>
              <InputHiddenPlane
                inputData={inputData}
                inputPlane={inputPlane}
                inputPos={inputPos}
                inputSize={inputSize}
                inputRowSize={inputRowSize}
                inputColSize={inputColSize}
                covolutionData={covolutionData}
                covolutionPlane={covolutionPlane}
                covolutionPos={covolutionPos}
                poolingData={poolingDataSigmoid}
                poolingPlane={poolingPlane}
                poolingPos={poolingPos}
                hiddenData={hiddenDataSigmoid}
                hiddenPlane={hiddenPlane}
                hiddenPos={hiddenPos}
              />
              <ResultMesh result={outputSoftmaxArr} pos={outputPos} />
              <DrawLineGroup
                inputData={inputData}
                inputPlane={inputPlane}
                inputPos={inputPos}
                inputSize={inputSize}
                inputRowSize={inputRowSize}
                inputColSize={inputColSize}
                poolingData={poolingDataSigmoid}
                poolingPlane={poolingPlane}
                poolingPos={poolingPos}
                hiddenData={hiddenDataSigmoid}
                hiddenPlane={hiddenPlane}
                hiddenPos={hiddenPos}
                resultData={outputSoftmaxArr}
                resultPlane={outputPlane}
                resultPos={outputPos}
              />
            </group>
            <OrbitControls />
          </Canvas>
        </div>
        {/* 画面の中央にLOADINGを表示する */}
        <div
          className={`${displayLoading} absolute top-0 left-0 w-full h-full`}
        >
          <div className="flex items-center justify-center h-screen">
            <div className="text-4xl font-bold text-white">LOADING</div>
          </div>
        </div>
      </div>

      <Sidebar
        displaySideBar={displaySideBar}
        setInputData={setInputData}
        inputData={inputData}
        isButtonClicked={isButtonClicked}
        windowSize={windowSize}
        clickbutton={clickButton}
      />
    </>
  );
}

export default App;
