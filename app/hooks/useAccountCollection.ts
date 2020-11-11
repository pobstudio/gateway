import { useEffect } from 'react';
import useSWR from 'swr';
import { useBlockchainStore } from '../stores/blockchain';
import { useCollectionsStore } from '../stores/collections';
import { fetcher } from '../utils/fetcher';
import { maybePluralizeWord } from '../utils/words';
import { useMemo } from 'react';
import { ADDRESS_REGEX } from '../utils/regex';
import { shortenHexString } from '../utils/hex';

export const useAccountCollection = (account?: string) => {
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const { data } = useSWR(
    useMemo(
      () =>
        !!account && ADDRESS_REGEX.test(account)
          ? `/api/collections?id=account&owner=${account}&blockNum=${blockNumber}`
          : null,
      [account, blockNumber],
    ),
    fetcher,
  );
  const updateCollectionHashOrIdMap = useCollectionsStore(
    (s) => s.updateCollectionHashOrIdMap,
  );
  const updateCollectionMetadataMap = useCollectionsStore(
    (s) => s.updateCollectionMetadataMap,
  );
  useEffect(() => {
    if (!data || !account) {
      return;
    }
    updateCollectionMetadataMap((update) => {
      update[account] = {
        name: 'Your Collection',
        seoName: `${shortenHexString(account)} Collection`,
        description: `${data.hashOrIds.length} ${maybePluralizeWord(
          'artwork',
          data.hashOrIds.length,
        )}`,
      };
    });
    updateCollectionHashOrIdMap((update) => {
      update[account] = data.hashOrIds;
    });
  }, [data, updateCollectionHashOrIdMap]);
};
