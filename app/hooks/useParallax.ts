import { useEffect } from 'react';
import { useState } from 'react';
import { RefObject, useMemo } from 'react';
import { useSpring } from 'react-spring';
import {
  useDebounce,
  useMouse,
  useMouseHovered,
  useWindowSize,
} from 'react-use';
import useMeasure from 'react-use-measure';

interface UseParallaxOpts {
  rCoeff?: [number, number];
  dCoeff?: [number, number];
  zIndex?: number;
}

export const useParallax = (
  delta?: [number, number],
  opts: UseParallaxOpts = {},
): any => {
  const rCoeff = opts.rCoeff ?? [0.01, 0.01];
  const dCoeff = opts.dCoeff ?? [0.01, 0.01];
  const zIndex = opts.zIndex ?? 0;
  const { springDelta } = useSpring({
    springDelta: delta ?? [0, 0],
    config: { mass: 1, tension: 40, friction: 10 },
  });

  if (!delta) {
    return {};
  }

  return {
    transform: springDelta.interpolate((...params) => {
      const rx = (rCoeff[0] * (params as any)[0]) as number;
      const ry = (-rCoeff[1] * (params as any)[1]) as number;
      const dx = (dCoeff[0] * zIndex * (params as any)[0]) as number;
      const dy = (dCoeff[1] * zIndex * (params as any)[1]) as number;

      return `translate3D(${dx}px, ${dy}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }),
  };
};

interface UseParallaxDeltaOpts {
  isDisabled?: boolean;
  deltaSnapbackMargin?: [number, number];
}

export const useParallaxDelta = (
  ref: RefObject<Element>,
  opts: UseParallaxDeltaOpts = {},
): [[number, number], [number, number]] => {
  const [mouseObj, setMouseObj] = useState({
    elW: 0,
    elH: 0,
    elX: 0,
    elY: 0,
  });

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    if (opts.isDisabled) {
      return;
    }
    const handleMouseHover = (e: any) => {
      if (!ref.current) {
        return;
      }
      const dimensions = ref.current?.getBoundingClientRect();
      setMouseObj({
        elX: e.offsetX,
        elY: e.offsetY,
        elW: dimensions?.width,
        elH: dimensions?.height,
      });
    };
    const handleMouseLeave = (e: any) => {
      if (!ref.current) {
        return;
      }
      const dimensions = ref.current?.getBoundingClientRect();
      setMouseObj({
        elX: 0,
        elY: 0,
        elW: dimensions?.width,
        elH: dimensions?.height,
      });
    };
    ref.current.addEventListener('mouseleave', handleMouseLeave);

    ref.current.addEventListener('mouseover', handleMouseHover);
    ref.current.addEventListener('mousemove', handleMouseHover);
    return () => {
      if (!ref.current) {
        return;
      }
      ref.current.removeEventListener('mouseleave', handleMouseLeave);
      ref.current.removeEventListener('mousemove', handleMouseHover);
      ref.current.removeEventListener('mouseover', handleMouseHover);
    };
  }, [ref, opts]);

  const delta: [number, number] = useMemo(() => {
    const { elX, elY, elW, elH } = mouseObj;
    if (opts.isDisabled) {
      return [0, 0];
    }

    if (
      elX <= (opts?.deltaSnapbackMargin?.[1] ?? 0) ||
      elY <= (opts?.deltaSnapbackMargin?.[0] ?? 0)
    ) {
      return [0, 0];
    }
    if (
      elX >= elW - (opts?.deltaSnapbackMargin?.[1] ?? 0) ||
      elY >= elH - (opts?.deltaSnapbackMargin?.[0] ?? 0)
    ) {
      return [0, 0];
    }
    return [elX - elW / 2, elY - elH / 2];
  }, [opts, mouseObj]);

  const [debouncedDelta, setDebouncedDelta] = useState<[number, number]>([
    0,
    0,
  ]);

  useDebounce(
    () => {
      setDebouncedDelta(delta);
    },
    5,
    [delta],
  );

  return useMemo(
    () => [
      debouncedDelta,
      [mouseObj.elW / 2, mouseObj.elH / 2] as [number, number],
    ],
    [debouncedDelta, mouseObj],
  );
};

// export const useParallaxDeltaOffset = (parentRef: RefObject<Element>, childRef: RefObject<Element>, delta: [number, number]): [number, number] => {
//   const windowSize = useWindowSize(0, 0);

//   const parentMeasure = useMemo(() => {
//     return parentRef.current?.getBoundingClientRect();
//   }, [parentRef, windowSize, delta]);

//   const childMeasure = useMemo(() => {
//     return childRef.current?.getBoundingClientRect();
//   }, [childRef, windowSize, delta]);

//   const deltaOffset: [number, number] = useMemo(() => {
//     if (!parentMeasure || !childMeasure) {
//       return [0, 0];
//     }
//     const parentCenter: [number, number] = [parentMeasure.x + (parentMeasure.width / 2), parentMeasure.y + (parentMeasure.height / 2)];
//     const childCenter: [number, number] = [childMeasure.x + (childMeasure.width / 2), childMeasure.y + (childMeasure.height / 2)];
//     console.log(childMeasure, parentMeasure, parentCenter, childCenter)
//     return [childCenter[0] - parentCenter[0], childCenter[1] - parentCenter[1]];
//   }, [parentMeasure, childMeasure]);

//   return useMemo(() => {
//     return [
//       delta[0] + deltaOffset[0],
//       delta[1] + deltaOffset[1],
//     ];
//   }, [delta, deltaOffset]);
// }
