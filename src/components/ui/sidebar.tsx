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
  );
};

export default Sidebar;
