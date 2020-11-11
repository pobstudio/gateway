import { useEffect } from 'react';
import { useState } from 'react';
import { TOKEN_TYPES, ZERO } from '../constants';
import { TOKEN_SYMBOL } from '../stores/tokens';
import { padHexString } from '../utils/hex';
import { usePobContract, usePobContractV1 } from './useContracts';
import { useTokenId } from './useTokenId';

// util check to see if it abides to id format
export const useHashFromMaybeHashOrId = (hashOrId: string | undefined) => {
  const minter = usePobContract();
  const minterV1 = usePobContractV1();

  const [hash, setHash] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!minter) {
      return;
    }
    if (!minterV1) {
      return;
    }
    if (!hashOrId) {
      return;
    }

    if (TOKEN_TYPES[TOKEN_SYMBOL].slice(0, 34) === hashOrId.slice(0, 34)) {
      minter.tokenIdToTxHash(hashOrId).then((h) => {
        if (h.eq(ZERO)) {
          setHash(hashOrId);
        } else {
          setHash(padHexString(h.toHexString()));
        }
      });
    } else if (TOKEN_TYPES['$HASHV1'].slice(0, 34) === hashOrId.slice(0, 34)) {
      minterV1.tokenIdToTxHash(hashOrId).then((h) => {
        if (h.eq(ZERO)) {
          setHash(hashOrId);
        } else {
          setHash(padHexString(h.toHexString()));
        }
      });
    } else {
      setHash(hashOrId);
    }
  }, [hashOrId]);

  return hash;
};
