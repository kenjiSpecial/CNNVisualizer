import { DoubleSide, Texture } from 'three';

type PixelPlaneProps = JSX.IntrinsicElements['group'] & {
  data: number[];
  size: number;
  space: number;
  rowSize: number;
  colSize: number;
};

export function inputPos(props: {
  index: number;
  rowSize: number;
  halfRowSize: number;
  size: number;
  space: number;
}) {
  const { index, rowSize, halfRowSize, size, space } = props;
  const posX = ((index % rowSize) - halfRowSize) * (size + space);
  const posY = (-Math.floor(index / rowSize) + halfRowSize) * (size + space);
  const posZ = 0;
  return { posX, posY, posZ };
}

export function PixelPlaneMesh(props: PixelPlaneProps) {
  // const data = [1, 2, 3, 4];
  const data = props.data;
  const { size, space, rowSize } = props;
  const halfRowSize = rowSize / 2;

  return (
    <group {...props}>
      {data.map((d, index) => {
        const colorVal = Math.floor(d * 255);
        const color = `rgb(${colorVal}, ${colorVal}, ${colorVal})`;

        const { posX, posY, posZ } = inputPos({
          index,
          rowSize,
          halfRowSize,
          size,
          space,
        });
        const key = `plane-${index}`;

        return (
          <mesh
            key={key}
            scale={[size, size, size]}
            position={[posX, posY, posZ]}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color={color} side={DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

type ParamsPixelPlaneProps = JSX.IntrinsicElements['group'] & {
  hiddenSize: number;
  hiddenValueArr: number[];
  size: number;
  space: number;
  rowSize: number;
  colSize: number;
};

export function hiddenPos(props: {
  index: number;
  rowSize: number;
  colSize: number;
  size: number;
  space: number;
}) {
  const { index, rowSize, colSize, size, space } = props;
  const posX = ((index % rowSize) - (rowSize - 1) / 2) * (size + space);
  const posY =
    (-Math.floor(index / rowSize) + (colSize - 1) / 2) * (size + space);
  const posZ = 0;
  return { posX, posY, posZ };
}

export function ParamsPixelPlaneMesh(props: ParamsPixelPlaneProps) {
  const arr = [];

  const { size, space } = props;
  const rowSize = props.rowSize;
  const colSize = props.colSize;

  for (let i = 0; i < props.hiddenSize; i++) {
    const colorVal = Math.floor(props.hiddenValueArr[i] * 255);
    const color = `rgb(${colorVal}, ${colorVal}, ${colorVal})`;

    const { posX, posY, posZ } = hiddenPos({
      index: i,
      rowSize,
      colSize,
      size,
      space,
    });
    const key = `plane-${i}`;
    arr.push(
      <mesh key={key} scale={[size, size, size]} position={[posX, posY, posZ]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={color} side={DoubleSide} />
      </mesh>,
    );
  }
  return <group {...props}>{arr}</group>;
}

type OutputMeshProps = JSX.IntrinsicElements['group'] & {
  outputSize: number;
  outputValueArr: number[];
  size: number;
  space: number;
  rowsize: number;
  colSize: number;
};

export function outputPos(props: {
  index: number;
  rowSize: number;
  colSize: number;
  size: number;
  space: number;
}) {
  const { index, rowSize, size, space, colSize } = props;
  const newIndex = index === 0 ? 9 : index - 1;
  const posX = ((newIndex % rowSize) - (rowSize - 1) / 2) * (size + space);
  const posY =
    (-Math.floor(newIndex / rowSize) + (colSize - 1) / 2) * (size + space);
  const posZ = 0;
  return { posX, posY, posZ };
}

export function OutputMeshGroup(props: OutputMeshProps) {
  const outputMeshArr = [];
  const { size, space, rowsize } = props;
  for (let ii = 0; ii < props.outputSize; ii++) {
    const colorVal = Math.floor(props.outputValueArr[ii] * 255);
    const color = `rgb(${colorVal}, ${colorVal}, ${colorVal})`;
    const { posX, posY, posZ } = outputPos({
      index: ii,
      rowSize: rowsize,
      colSize: props.colSize,
      size,
      space,
    });
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = 'black';
      ctx.font = '40px san-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${ii}`, 32, 32);
    }
    const texture = new Texture(canvas);
    texture.needsUpdate = true;
    const key = `plane-${ii}`;
    outputMeshArr.push(
      <mesh key={key} scale={[size, size, size]} position={[posX, posY, posZ]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} side={DoubleSide} />
      </mesh>,
    );
  }

  return <group {...props}>{outputMeshArr}</group>;
}
