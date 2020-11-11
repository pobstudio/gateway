import Link from 'next/link';
import styled from 'styled-components';
import { useTokensStore } from '../stores/tokens';
import { BaseAnchor } from './anchor';
import { useWindowSize } from 'react-use';
import { useMemo } from 'react';
import { BREAKPTS } from '../styles';
import {
  FOOTER_HEIGHT,
  MOBILE_FOOTER_HEIGHT,
  BLOG_LINK,
  TWITTER_LINK,
  DISCORD_LINK,
  GITHUB_LINK,
  IPFS_GATEWAY_LINK,
} from '../constants';

const FooterWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: ${FOOTER_HEIGHT}px;
  width: 100%;
  background: #1c1c1c;
  @media (max-width: ${BREAKPTS.SM}px) {
    height: ${MOBILE_FOOTER_HEIGHT}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`;

const FooterSideContentWrappper = styled.div`
  position: relative;
`;

const FooterLeftSideContentWrapper = styled(FooterSideContentWrappper)`
  display: flex;
  align-items: center;
  @media (max-width: ${BREAKPTS.SM}px) {
    flex-direction: column;
    justify-content: center;
  }
`;

const FooterRightSideContentWrappper = styled(FooterSideContentWrappper)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  @media (max-width: ${BREAKPTS.SM}px) {
    justify-content: center;
    padding-top: 10px;
  }
`;

const FooterLogoText = styled.a`
  color: white;
  font-size: 24px;
  font-family: Bebas Neue;
  text-decoration: none;
  padding-left: 24px;
  &:focus {
    color: black;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    padding-left: 0px;
  }
`;

const FooterLinkWrapper = styled.div`
  display: flex;
  padding-right: 24px;
  @media (max-width: ${BREAKPTS.SM}px) {
    padding-right: 0px;
  }
`;

const FooterLink = styled(BaseAnchor)`
  font-weight: 700;
  color: white;
  font-size: 14px;
  text-decoration: none;
  display: block;
  padding: 0 14px;
  &:focus {
    color: white;
  }
`;

export const Footer: React.FC = () => {
  const { width } = useWindowSize();
  const isMobile = useMemo(() => width <= BREAKPTS.SM, [width]);

  return (
    <FooterWrapper>
      <FooterLeftSideContentWrapper>
        <Link href={'/'} passHref={true}>
          <FooterLogoText>PoB</FooterLogoText>
        </Link>
        {/* {!isMobile && (
          <FooterLink
            style={{ paddingLeft: 20, opacity: 0.5 }}
            href={'https://twitter.com/dave4506'}
            target={'_blank'}
            onClick={() => track(ANALYTIC_EVENTS.FOOTER_CLICK_CREATOR)}
          >
            Made with 🩸 💦 💧 by{' '}
            <span style={{ textDecoration: 'underline' }}>David Sun</span>
          </FooterLink>
        )} */}
      </FooterLeftSideContentWrapper>
      <FooterRightSideContentWrappper>
        <FooterLinkWrapper>
          <FooterLink href={'#'} target={'_blank'}>
            Github
          </FooterLink>
          <FooterLink href={BLOG_LINK} target={'_blank'}>
            Blog
          </FooterLink>
          <FooterLink href={'#'} target={TWITTER_LINK}>
            Twitter
          </FooterLink>
          <FooterLink href={DISCORD_LINK} target={'_blank'}>
            Discord
          </FooterLink>
        </FooterLinkWrapper>
      </FooterRightSideContentWrappper>
    </FooterWrapper>
  );
};
