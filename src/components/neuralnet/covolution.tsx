import { useMemo } from 'react';
import {
  calcRelu4DArray,
  calculationCovolution,
  calculationPooling,
} from './functions';

export const useCovolutionMemo = (
  inputData: number[][][], // 3次元配列 [batchSize][channel][row * col]
  paramsW1: number[][][][] | undefined,
  paramsB1: number[] | undefined,
  inputRowSize: number,
  inputColSize: number,
  filterNum: number,
  filterRowSize: number,
  filterColSize: number,
  covolutionPadding: number,
  covolutionStride: number,
) => {
  return useMemo(() => {
    // const outputData = inputData.map((data, index) => {
    //   const row = Math.floor(index / filterRowSize);
    //   const col = index % filterColSize;
    //   const filter = filterNum * filterRowSize * filterColSize;
    //   const filterIndex = filter + row * filterColSize + col;
    //   const filterData = inputData[filterIndex];
    //   return data * filterData;
    // });
    // setOutputData(outputData);
    if (!paramsW1 || !paramsB1) return undefined;
    const out = calculationCovolution(
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
    return calcRelu4DArray(out);
  }, [
    inputData,
    paramsW1,
    paramsB1,
    inputRowSize,
    inputColSize,
    filterNum,
    filterRowSize,
    filterColSize,
    covolutionPadding,
    covolutionStride,
  ]);
};

export const usePoolingMemo = (
  inputData: number[][][][] | undefined,
  poolingRowSize: number,
  poolingColsize: number,
  poolingStride: number,
  PoolingPadding: number,
) => {
  return useMemo(() => {
    if (!inputData) return undefined;
    const inputFilterNum = inputData[0].length;
    const inputRowSize = inputData[0][0].length;
    const inputColSize = inputData[0][0][0].length;

    return calculationPooling(
      inputData,
      inputFilterNum,
      inputRowSize,
      inputColSize,
      poolingRowSize,
      poolingColsize,
      poolingStride,
      PoolingPadding,
    );
  }, [
    inputData,
    poolingRowSize,
    poolingColsize,
    poolingStride,
    PoolingPadding,
  ]);
};
