export interface Deployment {
  erc1155: string;
  whitelistProxy: string;
  pobMinter: string;
  pobMinterV2: string;
  process: string;
  rejectingTreasury: string;
}

export type Deployments = { [chainId: number]: Deployment };

// TODO
export interface TokenType {
  isFungible: boolean;
}

export interface TokenTypeMap {
  [id: string]: TokenType;
}

export type TokenTypeMaps = { [chainId: number]: any };
