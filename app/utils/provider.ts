import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

// account is not optional
export function getSigner(
  library: JsonRpcProvider,
  account: string,
): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(
  library: JsonRpcProvider,
  account?: string,
): JsonRpcProvider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}
