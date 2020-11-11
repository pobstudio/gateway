import { BigNumber } from 'ethers';
import { UseWalletProviderProps } from 'use-wallet';

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export const ZERO = BigNumber.from(0);

export const SPRING_CONFIG = { mass: 1, tension: 100, friction: 40 };

export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '1');

export const FORTMATIC_KEY = process.env.NEXT_PUBLIC_FORTMATIC_KEY || '';

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || '';

export const POB_PROD_LINK =
  process.env.NEXT_PUBLIC_POB_PROD_LINK || 'https://pob.studio';

export const USE_WALLET_CONNECTORS: UseWalletProviderProps['connectors'] = {
  walletconnect: {
    rpcUrl: RPC_URL,
  },
  fortmatic: { apiKey: FORTMATIC_KEY },
};

export const PREVIOUS_TOKEN_TYPE_MAX_INDEX = 55;

export const TOKEN_TYPES = {
  $HASHV1: '0x8000000000000000000000000000000100000000000000000000000000000000',
  $HASH: '0x8000000000000000000000000000000200000000000000000000000000000000',
};

export const DEFAULT_PREVIEW_HASHES = [
  '0x1b6d3cc31110ec6dc949319d3db8dfecd6328d1a16ea9a14eee093d813b9837c',
  '0xe4daa77a0de5be96234872cc38fa04682c3d1cc4597e759ca272d12670a991fa',
];

export const BLOG_LINK = `https://pobstudio.substack.com`;

export const TWITTER_LINK = `https://twitter.com/prrfbeauty`;

export const DISCORD_LINK = `https://discord.gg/x4SH5pGgvj`;

export const WHAT_IS_ALL_NONSENSE_LINK = `https://pobstudio.substack.com/p/deciphering-pobs-artistic-process`;

export const GITHUB_LINK = `https://github.com/proofofbeauty/gateway`;

export const IPFS_GATEWAY_LINK = `https://bafybeibzxnahlim2dvxxudfhriajjijm323gv3gvy7g3zpcws5ky4353ye.ipfs.dweb.link`;

export const MINT_BLOCK_NUM = 244555;

// dimensions
export const HEADER_HEIGHT = 100;
export const MOBILE_HEADER_HEIGHT = 80;
export const FOOTER_HEIGHT = 100;
export const MOBILE_FOOTER_HEIGHT = 140;
