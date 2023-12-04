// 数字をスライドすることができる
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import './App.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Vector3 } from 'three';
import { CanvasDrawing } from './components/visual/Canvas-drawing';
import { ministSampleData } from './components/visual/mnist-sample';
import { useWindowSize } from './components/visual/use-window-size';
import { InputHiddenPlane } from './components/visual/input-hidden-plane';

function App() {
  const autoNumCntRef = useRef(
    Math.floor(Math.random() * ministSampleData.length),
  );
  const isButtonClicked = useRef(false);

  const [inputData, setInputData] = useState<number[]>(
    ministSampleData[autoNumCntRef.current],
  );
  const ref = useRef<HTMLDivElement>(null);
  const windowSize = useWindowSize();

  const inputSize = 28 * 28;
  const inputRowSize = 28;
  const inputColSize = 28;

  // const hiddenSize = 50;
  // const hiddenRowSize = 10;
  // const hiddenColSize = 5;
  // const outputSize = 10;
  // const outputRowSize = 3;
  // const outputColSize = 4;

  const inputPlane = { size: 1 / 10, space: 0.02 }; // const size = 1 / 14       const space = 0.02;
  // const hiddenPlane = { size: 0.3, space: 0.1 };
  // const outputPlane = { size: 2, space: 0.3 };

  const inputPos = new Vector3(0, 0, 0);
  // const hiddenPos = new Vector3(0, 0, -4);
  // const outputPos = new Vector3(0, 0, -8);

  const [data, setData] = useState<{
    W1: number[][];
    b1: number[];
    W2: number[][];
    b2: number[];
    W3: number[][];
    b3: number[];
  } | null>(null);

  const isLoading = useMemo(() => {
    return data === null;
  }, [data]);
  const displayLoading = useMemo(() => {
    return isLoading ? 'block' : 'hidden';
  }, [isLoading]);
  const displayCanvas = useMemo(() => {
    return isLoading ? 'hidden' : 'block';
  }, [isLoading]);
  const displaySideBar = useMemo(() => {
    return isLoading ? 'hidden' : 'flex';
  }, [isLoading]);

  // const paramData = useMemo(() => {
  //   if (!data) return null;
  //   return data;
  // }, [data]);

  // インプットとparamsのW1をかけて、バイアスを足す
  // const hiddenValue = useMemo(() => {
  //   if (!paramData || !inputData) return null;

  //   const inp = new Matrix([inputData]);
  //   console.log(paramData);
  //   const wMatrix = new Matrix(paramData.W1);
  //   const bMatrix = new Matrix([paramData.b1]);
  //   const res = inp.mmul(wMatrix).add(bMatrix);
  //   const sigmoidMatrix = calcSigmoid(res);
  //   return { wMatrix: wMatrix, hiddenValueMatrix: sigmoidMatrix };
  // }, [paramData, inputData]);
  // const hiddenValueMatrix = hiddenValue?.hiddenValueMatrix;
  // const inputHiddenWMatrix = hiddenValue?.wMatrix;

  // const outputValue = useMemo(() => {
  //   if (!paramData || !hiddenValueMatrix) return null;

  //   const wMatrix = new Matrix(paramData.W2);
  //   const bMatrix = new Matrix([paramData.b2]);
  //   const res = hiddenValueMatrix.mmul(wMatrix).add(bMatrix);
  //   const softMaxMatrix = calcSoftMax(res);
  //   return { wMatrix: wMatrix, outputValueMatrix: softMaxMatrix };
  // }, [paramData, hiddenValueMatrix]);
  // const outputValueMatrix = outputValue?.outputValueMatrix;
  // const hiddenOutputWMatrix = outputValue?.wMatrix;

  // const paramArr = useMemo(() => {
  //   if (!hiddenOutputWMatrix || !inputHiddenWMatrix) return null;
  //   const inputHiddennArr = inputHiddenWMatrix.to1DArray();
  //   const minInputHiddenVal = Math.min(...inputHiddennArr);
  //   const maxInputHiddenVal = Math.max(...inputHiddennArr);
  //   const paramW1Arr = [];
  //   for (let i = 0; i < inputHiddenWMatrix.rows; i++) {
  //     const arr = [];
  //     for (let ii = 0; ii < inputHiddenWMatrix.columns; ii++) {
  //       arr.push(
  //         MathUtils.clamp(
  //           (inputHiddenWMatrix.get(i, ii) - minInputHiddenVal) /
  //             (maxInputHiddenVal - minInputHiddenVal),
  //           0,
  //           1,
  //         ),
  //       );
  //     }
  //     paramW1Arr.push(arr);
  //   }

  //   const hiddenOutputArr = hiddenOutputWMatrix.to1DArray();
  //   const minHiddenOutputVal = Math.min(...hiddenOutputArr);
  //   const maxHiddenOutputVal = Math.max(...hiddenOutputArr);
  //   const paramW2Arr = [];
  //   for (let i = 0; i < hiddenOutputWMatrix.rows; i++) {
  //     const arr = [];
  //     for (let ii = 0; ii < hiddenOutputWMatrix.columns; ii++) {
  //       arr.push(
  //         MathUtils.clamp(
  //           (hiddenOutputWMatrix.get(i, ii) - minHiddenOutputVal) /
  //             (maxHiddenOutputVal - minHiddenOutputVal),
  //           0,
  //           1,
  //         ),
  //       );
  //     }
  //     paramW2Arr.push(arr);
  //   }

  //   return { paramW1Arr, paramW2Arr };
  // }, [inputHiddenWMatrix, hiddenOutputWMatrix]);

  useEffect(() => {
    fetch('/cnn-params.json')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      });
  }, []);

  const clickbutton = useCallback(() => {
    autoNumCntRef.current = Math.floor(Math.random() * ministSampleData.length);
    isButtonClicked.current = true;
    setInputData(ministSampleData[autoNumCntRef.current]);
  }, []);

  return (
    <>
      <div
        className="h-screen  w-screen bg-gradient-to-t from-orange-100 to-blue-400 block cursor-grab "
        id="canvas"
      >
        <div className={`${displayCanvas} w-full h-2/3 sm:h-screen`}>
          <Canvas camera={{ position: [2, 2, 8] }}>
            <ambientLight />
            <pointLight position={[5, 5, 5]} />
            <Stats showPanel={0} className="stats" />
            <InputHiddenPlane
              inputData={inputData}
              // paramData={paramData}
              inputPlane={inputPlane}
              // hiddenPlane={hiddenPlane}
              // outputPlane={outputPlane}
              inputPos={inputPos}
              // hiddenPos={hiddenPos}
              // outputPos={outputPos}
              inputSize={inputSize}
              inputRowSize={inputRowSize}
              inputColSize={inputColSize}
              // hiddenSize={hiddenSize}
              // hiddenRowSize={hiddenRowSize}
              // hiddenColSize={hiddenColSize}
              // outputSize={outputSize}
              // outputRowSize={outputRowSize}
              // outputColSize={outputColSize}
            />

            {/* <group position={[0, 0, 2]}> */}
            {/*  {inputData ? (
                <PixelPlaneMesh
                  renderOrder={4}
                  position={inputPos}
                  data={inputData}
                  size={inputPlane.size}
                  space={inputPlane.space}
                  rowSize={inputRowSize}
                  colSize={inputColsize}
                />
              ) : null}

              {hiddenValueMatrix ? (
                <ParamsPixelPlaneMesh
                  renderOrder={3}
                  position={hiddenPos}
                  hiddenSize={hiddenSize}
                  hiddenValueArr={hiddenValueMatrix.to1DArray()}
                  size={hiddenPlane.size}
                  space={hiddenPlane.space}
                  rowSize={hiddenRowSize}
                  colSize={hiddenColSize}
                />
              ) : null}

              {outputValueMatrix ? (
                <OutputMeshGroup
                  renderOrder={2}
                  position={outputPos}
                  outputSize={outputSize}
                  outputValueArr={outputValueMatrix.to1DArray()}
                  size={outputPlane.size}
                  space={outputPlane.space}
                  rowsize={outputRowSize}
                  colSize={outputColSize}
                />
              ) : null} */}
            {/* 
              {inputData &&
              paramArr &&
              hiddenValueMatrix &&
              outputValueMatrix ? (
                <DrawLineGroup
                  inputSize={inputSize}
                  hiddenSize={hiddenSize}
                  outputSize={outputSize}
                  inputPos={inputPos}
                  hiddenPos={hiddenPos}
                  outputPos={outputPos}
                  paramW1Arr={paramArr.paramW1Arr}
                  paramW2Arr={paramArr.paramW2Arr}
                  input1DArr={inputData}
                  hidden1DArr={hiddenValueMatrix.to1DArray()}
                  output1DArr={outputValueMatrix.to1DArray()}
                  renderOrder={1}
                  input={
                    {
                      size: inputPlane.size,
                      space: inputPlane.space,
                      rowSize: inputRowSize,
                      colSize: inputColsize,
                    } as drawLineGroup['input']
                  }
                  hidden={{
                    size: hiddenPlane.size,
                    space: hiddenPlane.space,
                    rowSize: hiddenRowSize,
                    colSize: hiddenColSize,
                  }}
                  output={{
                    size: outputPlane.size,
                    space: outputPlane.space,
                    rowSize: outputRowSize,
                    colSize: outputColSize,
                  }}
                />
              ) : null}
            </group> */}

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

      <div
        className="
          fixed 
          sm:flex sm:flex-col sm:justify-between 
          left-0 
          bottom-0 sm:top-0 
          sm:h-full 
          w-full sm:w-96 
          bg-gray-100 z-10 bg-opacity-50 
          p-3
          sm:p-8 border-r border-gray-400
      "
      >
        <div className="hidden sm:block">
          <div className="text-2xl font-bold mb-2 ">
            <p>NNビジュアライザー</p>
          </div>

          <div className="text-base">
            <p>
              <a
                href="https://amzn.asia/d/fKFUgBV"
                target="_blank"
                className="text-blue-700 underline hover:text-blue-900"
              >
                ゼロから作るDeep Learning
              </a>
              の第4章のニューラルネットワークをリアルタイムに可視化しています。
            </p>
            <p>
              入力層756個、隠れ層50個、出力層10個のニューラルネットワークを可視化しています。
            </p>
          </div>
        </div>

        <div className={`${displaySideBar} flex-col justify-end`} ref={ref}>
          <div className="text-base sm:text-lg font-bold mb-1 sm:mb-2">
            スケッチキャンバス
          </div>
          <div className="mb-2 sm:mb-4">
            <div className="mb-2">
              <CanvasDrawing
                setInputData={setInputData}
                inputData={inputData}
                isButtonClicked={isButtonClicked}
                windowWidth={windowSize.width}
                parentRef={ref}
              />
            </div>
            <div className="text-left sm:text-right">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-sm sm:text-base text-white font-bold py-2 px-4 rounded"
                onClick={clickbutton}
              >
                画像テスト
              </button>
            </div>
          </div>
          <div className="text-xs sm:text-base mb-2 sm:mb-4 block">
            <p>
              スケッチキャンバスにスケッチをするか、画像テストボタンを押してください。自動でニューラルネットワークが推論を行います。
            </p>
            <p>スケッチは一筆書きになっています。</p>
          </div>
          <div>
            <p className="text-sm sm:text-base text-right">
              Code:{' '}
              <a
                href="https://github.com/kenjiSpecial/NNVisualizer"
                className="text-blue-700 underline hover:text-blue-900"
                target="_blank"
              >
                kenjiSpecial/NNVisualizer
              </a>
            </p>
            <p></p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
