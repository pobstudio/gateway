import React from 'react';
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import { ContentWrapper, MainContent } from '../../../../components/content';
import styled, { keyframes } from 'styled-components';
import { useRef } from 'react';
import { DIMENSIONS, sketch } from '@pob/sketches';
import { useEffect } from 'react';
import { useState } from 'react';
import { useMountedState } from 'react-use';

const Canvas = styled.canvas`
  width: ${DIMENSIONS[0] * 0.75}px;
  height: ${DIMENSIONS[1] * 0.75}px;
`;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { hash } = context.query;
  const result = await fetch(
    `http://${process.env.VERCEL_URL}/api/prerender?hash=${hash}`,
  );

  if (result.status === 200) {
    return {
      props: await result.json(),
    };
  }

  return {
    notFound: true,
  };
};

const PreviewPage: NextPage = (
  payload: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMounted = useMountedState();
  const [hasDrawn, setHasDrawn] = useState(false);
  useEffect(() => {
    if (isMounted() && !!canvasRef.current && !hasDrawn && !!payload) {
      canvasRef.current.width = DIMENSIONS[0];
      canvasRef.current.height = DIMENSIONS[1];

      const sketchContext = {
        gl: canvasRef.current.getContext('webgl'),
        width: DIMENSIONS[0],
        height: DIMENSIONS[1],
      };

      console.log(sketchContext, payload, 'context created');
      setHasDrawn(true);
      sketch(sketchContext, payload.data, payload.gene).render();
    }
  }, [isMounted, canvasRef, hasDrawn, payload]);

  return <Canvas ref={canvasRef} />;
};

export default React.memo(PreviewPage);
