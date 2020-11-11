import { BREAK } from 'graphql';
import findIndex from 'lodash/findIndex';
import React, { FC, useMemo } from 'react';
import { useSpring, animated } from 'react-spring';
import { usePrevious } from 'react-use';
import styled from 'styled-components';
import { CHAIN_ID, SPRING_CONFIG } from '../constants';
import { useAudioStore } from '../stores/audio';
import { useBlockchainStore } from '../stores/blockchain';
import { BREAKPTS } from '../styles';
import { BaseButton } from './button';
import { VolumeIcon, VolumeMuteIcon } from './icons/volume';
import { useAnalytics } from 'use-analytics';
import { ANALYTIC_EVENTS } from '../constants/analytics';
const AudioControlsWrapper = styled.div``;

const IconButton = styled(BaseButton)`
  width: 24px;
  display: block;
  height: 24px;
  opacity: 0.5;
`;

const UnmemoizedAudioControls: FC = () => {
  const { track } = useAnalytics();
  const { toggleIsAudioMuted, isAudioMuted } = useAudioStore();
  return (
    <IconButton
      onClick={() => {
        track(ANALYTIC_EVENTS.APP_AUDIO_MUTE_TOGGLED, {
          isAudioMuted: !isAudioMuted,
        });
        toggleIsAudioMuted();
      }}
    >
      {isAudioMuted ? <VolumeMuteIcon /> : <VolumeIcon />}
    </IconButton>
  );
};

export const AudioControls = React.memo(UnmemoizedAudioControls);
