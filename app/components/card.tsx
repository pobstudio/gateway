import React, {
  FC,
  HTMLProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { animated, config, useSpring } from 'react-spring';
import { useMountedState } from 'react-use';
import { DIMENSIONS, sketch } from '@pob/sketches';
import useSWR from 'swr';
import styled from 'styled-components';
import { useHashFromMaybeHashOrId } from '../hooks/useHashFromMaybeHashOrId';
import { LoadingCard, EmptyCard } from './loadingCard';
import { useParallax, useParallaxDelta } from '../hooks/useParallax';
import { useMinter } from '../hooks/useMinter';
import { fetchPrerenderLocally } from '../utils/api';
import { useCardStore } from '../stores/card';
import { useProvider } from '../hooks/useProvider';
import { TokenLabel } from './tokenLabel';

const LargeCardWrapper = styled.div`
  height: 100%;
  position: relative;
`;

const AnimatedLargeCardWrapper = animated(LargeCardWrapper);

const LargeCardWebglContainer = styled.div<{
  isArtFocused?: boolean;
  isExpanded?: boolean;
}>`
  width: 100%;
  height: 100%;
  z-index: 1;
  position: relative;
  cursor: ${(p) =>
    p.isExpanded === undefined
      ? 'cursor'
      : p.isExpanded
      ? p.isArtFocused
        ? 'url(/cursor/expand.svg) 20 20, pointer'
        : 'url(/cursor/shrink.svg) 20 20, pointer'
      : 'url(/cursor/click.svg) 20 20, pointer'};
`;

const LargeCardWebglScaleWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const ALargeCardWebglScaleWrapper = animated(LargeCardWebglScaleWrapper);

const SignatureImage = styled.img`
  position: absolute;
  bottom: 10px;
  right: -10px;
  width: 120px;
  z-index: 2;
`;

const StyledCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  z-index: 1;
  position: relative;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: absolute;
  z-index: 0;
`;

const AnimatedImage = animated(StyledImage);
const AnimatedCanvas = animated(StyledCanvas);

const AnimatedLargeCardWebglContainer = animated(LargeCardWebglContainer);

export type CardState = 'minimized' | 'normal' | 'prefetch';

export interface LargeCardProps {
  hashOrId: string;
  springProps?: any;
  cardState?: CardState;
  isClutter?: boolean;
  isExpanded?: boolean;
  setIsExpanded?: (e: boolean) => void;
  setIsClutter?: (c: boolean) => void;
}

const UnMemoizedLargeCard: FC<LargeCardProps & HTMLProps<HTMLDivElement>> = (
  props,
) => {
  const {
    cardState,
    className,
    style,
    hashOrId,
    springProps,
    isExpanded,
    isClutter,
    setIsExpanded,
    setIsClutter,
  } = props;

  const hash = useHashFromMaybeHashOrId(hashOrId);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const largeCardDimensions = useCardStore((s) => s.largeCardDimensions);
  const provider = useProvider();
  const { data: prerenderPayload, error } = useSWR(
    useMemo(() => (!!hash ? [provider, hash, 'prerender'] : null), [
      provider,
      hash,
    ]),
    fetchPrerenderLocally,
    {},
  );
  // render the webgl context if its not prefetch state
  const isMounted = useMountedState();
  const [hasDrawn, setHasDrawn] = useState(false);

  // loading
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleHasDrawn = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  const isParallax = useMemo(() => {
    return !isClutter && isExpanded && cardState === 'normal';
  }, [isClutter, isExpanded, cardState]);

  const shouldShowWebgl = useMemo(() => {
    return (
      !!hash &&
      !!prerenderPayload &&
      isMounted() &&
      largeCardDimensions[0] !== 0 &&
      cardState === 'normal'
    );
  }, [
    hash,
    prerenderPayload,
    isMounted,
    largeCardDimensions,
    isParallax,
    cardState,
  ]);

  const webglRef = useRef<HTMLDivElement | null>(null);

  const [delta] = useParallaxDelta(
    webglRef,
    useMemo(() => ({ isDisabled: !isParallax }), [isParallax]),
  );
  const webglContainerParallaxStyles = useParallax(delta, {
    rCoeff: [0.04, 0.04],
    dCoeff: [0.04, 0.04],
    zIndex: 1,
  });

  const handleArtworkClick = useCallback(() => {
    if (!isExpanded) {
      setIsExpanded?.(true);
    } else if (isClutter) {
      setIsClutter?.(false);
    } else {
      setIsClutter?.(true);
    }
  }, [isClutter, isExpanded, setIsExpanded]);

  const expandedProps = useSpring({
    scale: useMemo(() => (isParallax ? 1.1 : 1.0), [isParallax]),
    config: config.default,
  });

  const { mintingStatus } = useMinter(
    useMemo(() => (cardState === 'normal' ? hash : undefined), [
      hash,
      cardState,
    ]),
  );
  const shouldShowSignature = useMemo(() => {
    return (
      mintingStatus === 'minted' ||
      mintingStatus === 'success' ||
      mintingStatus === 'proud-owner'
    );
  }, [mintingStatus]);

  const shouldShowTokenLabel = useMemo(() => {
    return !isParallax;
  }, [isParallax]);

  return (
    <AnimatedLargeCardWrapper
      className={className}
      style={{
        width: `${largeCardDimensions[0]}px`,
        height: `${largeCardDimensions[1]}px`,
        pointerEvents: cardState === 'normal' ? 'auto' : 'none',
        ...style,
        ...springProps,
      }}
    >
      <ALargeCardWebglScaleWrapper
        ref={webglRef}
        style={{
          transform: expandedProps.scale.interpolate((s) => `scale(${s})`),
        }}
      >
        <AnimatedLargeCardWebglContainer
          style={webglContainerParallaxStyles}
          isExpanded={isExpanded}
          isArtFocused={isClutter}
          onClick={handleArtworkClick}
        >
          {shouldShowWebgl && (
            <WebglDrawer
              prerenderPayload={prerenderPayload}
              onHasDrawn={handleHasDrawn}
            />
          )}
          <LoadingCard isLoading={isImageLoading} />
          {shouldShowSignature && <SignatureImage src={'/signature.png'} />}
          {shouldShowTokenLabel && <StyledTokenLabel />}
        </AnimatedLargeCardWebglContainer>
      </ALargeCardWebglScaleWrapper>
    </AnimatedLargeCardWrapper>
  );
};

const UnMemoizedWebglDrawer: FC<{
  prerenderPayload: any;
  onHasDrawn?: () => void;
}> = ({ onHasDrawn, prerenderPayload }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    // if (hasDrawn) {
    //   return;
    // }

    canvasRef.current.width = DIMENSIONS[0];
    canvasRef.current.height = DIMENSIONS[1];
    const gl = canvasRef.current.getContext('webgl');

    const sketchContext = {
      gl,
      width: DIMENSIONS[0],
      height: DIMENSIONS[1],
    };

    // setHasDrawn(true);
    onHasDrawn?.();
    const sketcher = sketch(
      sketchContext,
      prerenderPayload.data,
      prerenderPayload.gene,
    );

    sketcher.render();

    return () => {
      sketcher.end();
      if (!!gl) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    };
  }, [onHasDrawn, canvasRef, prerenderPayload]);

  // useUnmount(() => {
  //   console.log(canvasRef.current, 'hello');
  //   const gl = canvasRef?.current?.getContext('webgl');
  //   if (!!gl) {
  //     console.log('destroy')
  //     gl.getExtension('WEBGL_lose_context')?.loseContext();
  //   }
  // });

  return <AnimatedCanvas ref={canvasRef} />;
};

const WebglDrawer = React.memo(UnMemoizedWebglDrawer);

const StyledTokenLabel = styled(TokenLabel)`
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
`;

const UnMemoizedGhostCard: FC<
  { springProps?: any; showEmpty: boolean } & HTMLProps<HTMLDivElement>
> = ({ className, style, springProps, showEmpty }) => {
  const largeCardDimensions = useCardStore((s) => s.largeCardDimensions);

  return (
    <AnimatedLargeCardWrapper
      className={className}
      style={{
        width: `${largeCardDimensions[0]}px`,
        height: `${largeCardDimensions[1]}px`,
        pointerEvents: 'none',
        ...style,
        ...springProps,
      }}
    >
      {showEmpty && (
        <AnimatedLargeCardWebglContainer>
          <EmptyCard />
        </AnimatedLargeCardWebglContainer>
      )}
    </AnimatedLargeCardWrapper>
  );
};
export const GhostCard = React.memo(UnMemoizedGhostCard);
export const LargeCard = React.memo(UnMemoizedLargeCard);
