import { useMemo, useRef } from 'react';
import { BufferGeometry, DoubleSide, MathUtils, Texture, Vector3 } from 'three';

type PixelPlaneProps = JSX.IntrinsicElements['group'] & {
  data: number[];
  size: number;
  space: number;
  rowSize: number;
  colSize: number;
};

function inputPos(props: {
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

function hiddenPos(props: {
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

function outputPos(props: {
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

type drawLineGroup = JSX.IntrinsicElements['group'] & {
  inputSize: number;
  hiddenSize: number;
  outputSize: number;
  inputPos: Vector3;
  hiddenPos: Vector3;
  outputPos: Vector3;
  paramW1Arr: number[][];
  paramW2Arr: number[][];
  input1DArr: number[];
  hidden1DArr: number[];
  output1DArr: number[];
  input: {
    size: number;
    space: number;
    rowSize: number;
    colSize: number;
  };
  hidden: {
    size: number;
    space: number;
    rowSize: number;
    colSize: number;
  };
  output: {
    size: number;
    space: number;
    rowSize: number;
    colSize: number;
  };
};

export function DrawLineGroup(props: drawLineGroup) {
  const {
    input,
    hidden,
    output,
    inputSize,
    hiddenSize,
    outputSize,
    input1DArr,
    hidden1DArr,
    output1DArr,
  } = props;
  // const [lineArr, setLineArr] = useState<JSX.Element[]>([]);
  const geometry = useRef<BufferGeometry>(null!);

  const pos = useMemo(() => {
    const arr = [];
    for (let i = 0; i < inputSize; i++) {
      const inputObj = inputPos({
        index: i,
        rowSize: input.rowSize,
        halfRowSize: input.rowSize / 2,
        size: input.size,
        space: input.space,
      });
      const inputPosVector = new Vector3(
        inputObj.posX + props.inputPos.x,
        inputObj.posY + props.inputPos.y,
        inputObj.posZ + props.inputPos.z,
      );

      for (let ii = 0; ii < hiddenSize; ii++) {
        const hiddenObj = hiddenPos({
          index: ii,
          rowSize: hidden.rowSize,
          colSize: hidden.colSize,
          size: hidden.size,
          space: hidden.space,
        });

        const hiddenPosVector = new Vector3(
          hiddenObj.posX + props.hiddenPos.x,
          hiddenObj.posY + props.hiddenPos.y,
          hiddenObj.posZ + props.hiddenPos.z,
        );

        const randInputRad = (input.size / 2) * MathUtils.randFloat(0.1, 0.9);
        const randHiddenRad = (hidden.size / 2) * MathUtils.randFloat(0.1, 0.9);
        const randInputAngle = MathUtils.randFloat(0, Math.PI * 2);
        const randHiddenAngle = MathUtils.randFloat(0, Math.PI * 2);
        const randInputX = randInputRad * Math.cos(randInputAngle);
        const randInputY = randInputRad * Math.sin(randInputAngle);
        const randHiddenX = randHiddenRad * Math.cos(randHiddenAngle);
        const randHiddenY = randHiddenRad * Math.sin(randHiddenAngle);

        arr.push(inputPosVector.x + randInputX);
        arr.push(inputPosVector.y + randInputY);
        arr.push(inputPosVector.z);
        arr.push(hiddenPosVector.x + randHiddenX);
        arr.push(hiddenPosVector.y + randHiddenY);
        arr.push(hiddenPosVector.z);
      }
    }

    for (let i = 0; i < hiddenSize; i++) {
      const hiddenObj = hiddenPos({
        index: i,
        rowSize: hidden.rowSize,
        colSize: hidden.colSize,
        size: hidden.size,
        space: hidden.space,
      });
      const hiddenPosVector = new Vector3(
        hiddenObj.posX + props.hiddenPos.x,
        hiddenObj.posY + props.hiddenPos.y,
        hiddenObj.posZ + props.hiddenPos.z,
      );
      for (let j = 0; j < outputSize; j++) {
        const { posX, posY, posZ } = outputPos({
          index: j,
          rowSize: output.rowSize,
          colSize: output.colSize,
          size: output.size,
          space: output.space,
        });
        const outputPosVector = new Vector3(
          posX + props.outputPos.x,
          posY + props.outputPos.y,
          posZ + props.outputPos.z,
        );
        const randHiddenRad = (hidden.size / 2) * MathUtils.randFloat(0.1, 0.9);
        const randOutputRad = (output.size / 2) * MathUtils.randFloat(0.1, 0.9);
        const randHiddenAngle = MathUtils.randFloat(0, Math.PI * 2);
        const randOutputAngle = MathUtils.randFloat(0, Math.PI * 2);
        const randHiddenX = randHiddenRad * Math.cos(randHiddenAngle);
        const randHiddenY = randHiddenRad * Math.sin(randHiddenAngle);
        const randOutputX = randOutputRad * Math.cos(randOutputAngle);
        const randOutputY = randOutputRad * Math.sin(randOutputAngle);

        arr.push(hiddenPosVector.x + randHiddenX);
        arr.push(hiddenPosVector.y + randHiddenY);
        arr.push(hiddenPosVector.z);
        arr.push(outputPosVector.x + randOutputX);
        arr.push(outputPosVector.y + randOutputY);
        arr.push(outputPosVector.z);
      }
    }

    if (geometry.current) {
      geometry.current.attributes.position.needsUpdate = true;
    }
    return new Float32Array(arr);
  }, []);

  const color = useMemo(() => {
    const colors = [];
    for (let i = 0; i < inputSize; i++) {
      const color1 = input1DArr[i];
      const alpha1 = MathUtils.clamp(input1DArr[i] * 0.3, 0.02, 1);

      for (let ii = 0; ii < hiddenSize; ii++) {
        const color2 = hidden1DArr[ii];
        const alpha2 = hidden1DArr[ii] * hidden1DArr[ii] * 0.1;

        colors.push(
          color1,
          color1,
          color1,
          alpha1,
          color2,
          color2,
          color2,
          alpha2,
        );
      }
    }

    for (let i = 0; i < hiddenSize; i++) {
      const color1 = hidden1DArr[i];
      const alpha1 = MathUtils.clamp(hidden1DArr[i], 0.1, 1);
      for (let j = 0; j < outputSize; j++) {
        const color2 = output1DArr[j];
        const alpha2 = MathUtils.clamp(output1DArr[j] * 3, 0.01, 1);

        colors.push(
          color1,
          color1,
          color1,
          alpha1,
          color2,
          color2,
          color2,
          alpha2,
        );
      }
    }

    if (geometry.current) {
      geometry.current.attributes.color.needsUpdate = true;
    }
    return new Float32Array(colors);
  }, [input1DArr, hidden1DArr, output1DArr]);

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
        depthTest={true}
        depthWrite={false}
      />
    </lineSegments>
  );
}
