export const calculationCovolution = (
  inputData: number[][][],
  inputRowSize: number,
  inputColSize: number,
  paramsW1: number[][][][],
  paramsB1: number[],
  filterNum: number,
  filterRowSize: number,
  filterColSize: number,
  covolutionPadding: number,
  covolutionStride: number,
) => {
  // ここに処理を書く
  const covolutionData = [];
  const batchSize = inputData.length;
  const channelSize = inputData[0].length;
  const outputRowSize =
    (inputRowSize + 2 * covolutionPadding - filterRowSize) / covolutionStride +
    1;
  const outputColSize =
    (inputColSize + 2 * covolutionPadding - filterColSize) / covolutionStride +
    1;

  // 畳み込み演算を行う
  for (let b = 0; b < batchSize; b++) {
    const batchData = [];
    for (let n = 0; n < filterNum; n++) {
      const filterData = [];
      for (let i = 0; i < outputRowSize; i++) {
        const rowData = [];
        for (let j = 0; j < outputColSize; j++) {
          let sum = 0;
          for (let m = 0; m < channelSize; m++) {
            for (let k = 0; k < filterRowSize; k++) {
              for (let l = 0; l < filterColSize; l++) {
                const row = i * covolutionStride + k - covolutionPadding;
                const col = j * covolutionStride + l - covolutionPadding;
                if (
                  row >= 0 &&
                  row < inputRowSize &&
                  col >= 0 &&
                  col < inputColSize
                ) {
                  const index = row * inputColSize + col;
                  sum += inputData[b][m][index] * paramsW1[n][m][k][l];
                }
              }
            }
          }
          rowData.push(sum + paramsB1[n]);
        }
        filterData.push(rowData);
      }
      batchData.push(filterData);
    }
    covolutionData.push(batchData);
  }

  return covolutionData;
};

// プーリング層の計算を行う
export const calculationPooling = (
  inputData: number[][][][],
  filterNum: number,
  inputRowSize: number,
  inputColSize: number,
  poolingRowSize: number,
  poolingColSize: number,
  poolingStride: number,
  poolingPadding: number,
) => {
  // ここにプーリング層の計算を書く
  const poolingData = [];
  const outputRowSize =
    (inputRowSize + 2 * poolingPadding - poolingRowSize) / poolingStride + 1;
  const outputColSize =
    (inputColSize + 2 * poolingPadding - poolingColSize) / poolingStride + 1;
  const batchSize = inputData.length;

  // プーリング演算を行う (Maxプーリング)

  for (let b = 0; b < batchSize; b++) {
    const batchData = [];
    for (let n = 0; n < filterNum; n++) {
      const filterData = [];
      for (let i = 0; i < outputRowSize; i++) {
        const rowData = [];
        for (let j = 0; j < outputColSize; j++) {
          let max = -Infinity;
          for (let k = 0; k < poolingRowSize; k++) {
            for (let l = 0; l < poolingColSize; l++) {
              const row = i * poolingStride + k - poolingPadding;
              const col = j * poolingStride + l - poolingPadding;
              if (
                row >= 0 &&
                row < inputRowSize &&
                col >= 0 &&
                col < inputColSize
              ) {
                max = Math.max(max, inputData[b][n][row][col]);
              }
            }
          }
          rowData.push(max);
        }
        filterData.push(rowData);
      }
      batchData.push(filterData);
    }
    poolingData.push(batchData);
  }

  return poolingData;
};

export function reshapeArray(array: number[][][][]) {
  const reshapeArray = [];
  const batchSize = array.length;
  const channelSize = array[0].length;
  const rowSize = array[0][0].length;
  const colSize = array[0][0][0].length;

  for (let b = 0; b < batchSize; b++) {
    const reshapeRowData = [];
    for (let c = 0; c < channelSize; c++) {
      for (let r = 0; r < rowSize; r++) {
        for (let col = 0; col < colSize; col++) {
          reshapeRowData.push(array[b][c][r][col]);
        }
      }
    }
    reshapeArray.push(reshapeRowData);
  }

  return reshapeArray;
}

export function reshapeImageArray(array: number[][][][]) {
  const reshapeArray = [];
  const batchSize = array.length;
  const channelSize = array[0].length;
  const rowSize = array[0][0].length;
  const colSize = array[0][0][0].length;

  for (let b = 0; b < batchSize; b++) {
    const reshapeRowData = [];
    for (let c = 0; c < channelSize; c++) {
      const reshapeData = [];
      for (let r = 0; r < rowSize; r++) {
        for (let col = 0; col < colSize; col++) {
          reshapeData.push(array[b][c][r][col]);
        }
      }
      reshapeRowData.push(reshapeData);
    }
    reshapeArray.push(reshapeRowData);
  }

  return reshapeArray;
}

export const reshapeArray3to1 = (array: number[][][]) => {
  const reshapeArray = [];
  const batchSize = array.length;
  const rowSize = array[0].length;
  const colSize = array[0][0].length;

  for (let b = 0; b < batchSize; b++) {
    const reshapeRowData = [];
    for (let r = 0; r < rowSize; r++) {
      for (let col = 0; col < colSize; col++) {
        reshapeRowData.push(array[b][r][col]);
      }
    }
    reshapeArray.push(reshapeRowData);
  }

  return reshapeArray;
};

// アフィン変換の計算を行う
export const calcAffine = (
  input: number[][],
  weight: number[][],
  bias: number[],
) => {
  // ここにアフィン変換の計算を書く
  const output = [];
  for (let i = 0; i < input.length; i++) {
    const row = [];
    for (let j = 0; j < weight[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < input[0].length; k++) {
        sum += input[i][k] * weight[k][j];
      }
      row.push(sum + bias[j]);
    }
    output.push(row);
  }

  return output;
};

export const calcRelu2DArray = (input: number[][]) => {
  // ここにReLU関数の計算を書く
  const output = [];
  for (let i = 0; i < input.length; i++) {
    const row = [];
    for (let j = 0; j < input[0].length; j++) {
      row.push(Math.max(0, input[i][j]));
    }
    output.push(row);
  }
  return output;
};

export const calcRelu4DArray = (input: number[][][][]) => {
  // ここにReLU関数の計算を書く
  const output = [];
  for (let b = 0; b < input.length; b++) {
    const batchData = [];
    for (let n = 0; n < input[0].length; n++) {
      const filterData = [];
      for (let i = 0; i < input[0][0].length; i++) {
        const rowData = [];
        for (let j = 0; j < input[0][0][0].length; j++) {
          rowData.push(Math.max(0, input[b][n][i][j]));
        }
        filterData.push(rowData);
      }
      batchData.push(filterData);
    }
    output.push(batchData);
  }
  return output;
};

// softmax関数の計算を行う
export const calcSoftMax = (input: number[][]) => {
  const output = [];
  for (let i = 0; i < input.length; i++) {
    let sum = 0;
    const row = [];
    // rowの最大値を求める
    const maxVal = Math.max(...input[i]);
    for (let j = 0; j < input[0].length; j++) {
      sum += Math.exp(input[i][j] - maxVal);
    }
    for (let j = 0; j < input[0].length; j++) {
      row.push(Math.exp(input[i][j] - maxVal) / sum);
    }
    output.push(row);
  }
  return output;
};
