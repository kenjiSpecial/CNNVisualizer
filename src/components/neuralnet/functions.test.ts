import {
  calcAffine,
  calcRelu2DArray,
  calcRelu4DArray,
  calcSoftMax,
  calculationCovolution,
  calculationPooling,
  reshapeArray,
  reshapeImageArray,
  // reshapeArray3to1,
} from './functions'; // ここにテスト対象の関数をimportする

// eslint-disable-next-line @typescript-eslint/no-var-requires
const testSample = require('./testData/testData.json') as unknown as {
  testData: number[][][][];
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cnnParams = require('../../../public/cnn-params.json') as unknown as {
  W1: number[][][][];
  b1: number[];
  W2: number[][];
  b2: number[];
  W3: number[][];
  b3: number[];
};

test('covolution', () => {
  const inputData = [[[1, 2, 3, 4, 5, 6, 7, 8, 9]]];
  const inputRowSize = 3;
  const inputColSize = 3;
  const paramsW1 = [
    [
      [
        [1, 2],
        [3, 4],
      ],
    ],
    [
      [
        [5, 6],
        [7, 8],
      ],
    ],
  ];
  const paramsB1 = [1, 2];
  const filterNum = 2;
  const filterRowSize = 2;
  const filterColSize = 2;
  const covolutionPadding = 0;
  const covolutionStride = 1;
  const result = calculationCovolution(
    inputData,
    inputRowSize,
    inputColSize,
    paramsW1,
    paramsB1,
    filterNum,
    filterRowSize,
    filterColSize,
    covolutionPadding,
    covolutionStride,
  );
  const expected = [
    [
      [
        [1 * 1 + 2 * 2 + 4 * 3 + 5 * 4 + 1, 2 * 1 + 3 * 2 + 5 * 3 + 6 * 4 + 1],
        [4 * 1 + 5 * 2 + 7 * 3 + 8 * 4 + 1, 5 * 1 + 6 * 2 + 8 * 3 + 9 * 4 + 1],
      ],
      [
        [1 * 5 + 2 * 6 + 4 * 7 + 5 * 8 + 2, 2 * 5 + 3 * 6 + 5 * 7 + 6 * 8 + 2],
        [4 * 5 + 5 * 6 + 7 * 7 + 8 * 8 + 2, 5 * 5 + 6 * 6 + 8 * 7 + 9 * 8 + 2],
      ],
    ],
  ];

  expect(result).toEqual(expected);
});

it('calculationPoolingのテスト', () => {
  const inputData = [
    [
      [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ],
      [
        [17, 18, 19, 20],
        [21, 22, 23, 24],
        [25, 26, 27, 28],
        [29, 30, 31, 32],
      ],
    ],
  ];

  const inputRowSize = 4;
  const inputColSize = 4;
  const filterNum = 2;
  const poolingStride = 2;
  const poolingPadding = 0;
  const poolingRowSize = 2;
  const poolingColSize = 2;
  const result = calculationPooling(
    inputData,
    filterNum,
    inputRowSize,
    inputColSize,
    poolingRowSize,
    poolingColSize,
    poolingStride,
    poolingPadding,
  );

  const expected = [
    [
      [
        [6, 8],
        [14, 16],
      ],
      [
        [22, 24],
        [30, 32],
      ],
    ],
  ];

  expect(result).toEqual(expected);
});

it('reshapeArrayのテスト', () => {
  const array = [
    [
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
    ],
  ];

  const result = reshapeArray(array);

  const expected = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9]];

  expect(result).toEqual(expected);
});

it('covolutionのテスト', () => {
  const testData = reshapeImageArray(testSample.testData);

  // batch size
  expect(testData.length).toBe(1);
  // color channel size
  expect(testData[0].length).toBe(1);
  // image data size
  expect(testData[0][0].length).toBe(28 * 28);

  const W1 = cnnParams.W1;
  const b1 = cnnParams.b1;
  // const W2 = cnnParams.W2;

  const calcValue1 = calculationCovolution(
    testData,
    28,
    28,
    W1,
    b1,
    30,
    5,
    5,
    0,
    1,
  );
  expect(calcValue1.length).toBe(1);
  expect(calcValue1[0].length).toBe(30);
  expect(calcValue1[0][0].length).toBe(24);
  expect(calcValue1[0][0][0].length).toBe(24);
  expect(calcValue1[0][0][0][0]).toBeCloseTo(-0.2849);

  const calcValue2 = calcRelu4DArray(calcValue1);
  expect(calcValue2.length).toBe(1);
  expect(calcValue2[0].length).toBe(30);
  expect(calcValue2[0][0].length).toBe(24);
  expect(calcValue2[0][0][0].length).toBe(24);
  expect(calcValue2[0][0][0][0]).toEqual(0);
  expect(calcValue2[0][0][4][4]).toBeCloseTo(0.053);

  const calcValue3 = calculationPooling(calcValue2, 30, 24, 24, 2, 2, 2, 0);
  expect(calcValue3.length).toBe(1);
  expect(calcValue3[0].length).toBe(30);
  expect(calcValue3[0][0].length).toBe(12);
  expect(calcValue3[0][0][0].length).toBe(12);
  expect(calcValue3[0][0][0][0]).toEqual(0);
  expect(calcValue3[0][0][2][2]).toBeCloseTo(0.063);

  const calcValue4 = reshapeArray(calcValue3);
  expect(calcValue4.length).toBe(1);
  expect(calcValue4[0].length).toBe(30 * 12 * 12);

  const calcValue5 = calcAffine(calcValue4, cnnParams.W2, cnnParams.b2);
  expect(calcValue5.length).toBe(1);
  expect(calcValue5[0].length).toBe(100);
  expect(calcValue5[0][0]).toBeCloseTo(3.924);

  const calcValue6 = calcRelu2DArray(calcValue5);
  expect(calcValue6.length).toBe(1);
  expect(calcValue6[0].length).toBe(100);
  expect(calcValue6[0][0]).toBeCloseTo(3.924);
  expect(calcValue6[0][2]).toEqual(0);

  const calcValue7 = calcAffine(calcValue6, cnnParams.W3, cnnParams.b3);
  expect(calcValue7.length).toBe(1);
  expect(calcValue7[0].length).toBe(10);

  // calcValue7の最大値のインデックスを取得する
  let maxIndex = 0;
  let maxValue = calcValue7[0][0];
  for (let i = 1; i < calcValue7[0].length; i++) {
    if (calcValue7[0][i] > maxValue) {
      maxIndex = i;
      maxValue = calcValue7[0][i];
    }
  }

  expect(maxIndex).toBe(7);

  const calcValue8 = calcSoftMax(calcValue7);
  expect(calcValue8.length).toBe(1);
  expect(calcValue8[0].length).toBe(10);
  expect(calcValue8[0][7]).toBeCloseTo(1);
});
