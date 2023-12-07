import React, { useRef } from 'react';
import { CanvasDrawing } from '../visual/Canvas-drawing';
import { IWindowSize } from '../visual/use-window-size';

interface SidebarProps {
  displaySideBar: string;
  setInputData: (inputData: number[]) => void;
  inputData: number[];
  isButtonClicked: React.MutableRefObject<boolean>;
  windowSize: IWindowSize;
  clickbutton: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  displaySideBar,
  setInputData,
  inputData,
  isButtonClicked,
  windowSize,
  clickbutton,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
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
          <p>CNNビジュアライザー</p>
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
            の第7章の畳み込みニューラルネットワーク(CNN)をリアルタイムに可視化しています。
          </p>
          <p>
            入力層
            、畳み込み層+プーリング層、全結合層、出力層の4つの層に分けています。
          </p>
          <p>
            畳み込み層とプーリング層は、畳み込み層の出力をプーリング層に入力することで、画像の特徴を抽出しています。シンプルなニューラルネットワークを可視化したNNビジュアライザーと比較してみると、畳み込みがどのように変化しているかがわかります。
          </p>

          <div className="text-right">
            参考:{' '}
            <a
              href="https://ks-nnvisualizer.netlify.app/"
              target="_blank"
              className="text-blue-700 underline hover:text-blue-900"
            >
              NNビジュアライザ-
            </a>
          </div>
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
              href="https://github.com/kenjiSpecial/CNNVisualizer"
              className="text-blue-700 underline hover:text-blue-900"
              target="_blank"
            >
              kenjiSpecial/CNNVisualizer
            </a>
          </p>
          <p></p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
