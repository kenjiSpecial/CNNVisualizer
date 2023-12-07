import { Text } from '@react-three/drei';
import { useMemo } from 'react';
import { Vector3 } from 'three';

type ResultMeshProps = JSX.IntrinsicElements['group'] & {
  result: number[] | undefined;
  pos: Vector3;
};

export function ResultMesh(props: ResultMeshProps) {
  // result[0]が存在するとき、result[0]のarrayをsoftmax関数にかける。
  // softmax関数をかけた結果の配列を返す。
  // result[0]が存在しないとき、undefinedを返す。
  // useMemoを使って、キャッシュする。

  // console.log(softmaxArr);

  // groupを作成する。groupの中にTextを作成する。textは0-9の数字を表示する。
  // useMemoを使って、キャッシュする。
  const textGroup = useMemo(() => {
    const textArr = [];

    for (let i = 0; i < 10; i++) {
      const theta = (i * Math.PI) / 5 - Math.PI / 2;
      const rad = 8;
      const x = Math.cos(theta) * rad;
      const y = -Math.sin(theta) * rad;
      const z = 0;
      const pos = new Vector3(x, y, z);
      const fontSize =
        props.result && props.result[i]
          ? 7 * Math.max(props.result[i], 0.05)
          : 0.05;
      textArr.push(
        <Text
          key={`text-${i}`}
          color={'white'}
          fontSize={fontSize}
          position={pos}
        >{`${i}`}</Text>,
      );
    }
    return textArr;
  }, [props.result]);

  return <group position={props.pos}>{textGroup}</group>;
}
