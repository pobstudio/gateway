import { useEffect, FC } from 'react';
import { useBlockchainStore } from '../stores/blockchain';
import { useTransactionsStore } from '../stores/transaction';
import { useWallet } from 'use-wallet';
import { useToastsStore } from '../stores/toasts';
import { useProvider } from '../hooks/useProvider';
export const TransactionsEffect: FC = () => {
  const blockNumber = useBlockchainStore((s) => s.blockNumber);
  const { account, chainId } = useWallet();
  const provider = useProvider();
  const { transactionMap, updateTransactionMap } = useTransactionsStore();
  const addTxToast = useToastsStore((s) => s.addTxToast);

  useEffect(() => {
    if (!account || !chainId || !blockNumber || !provider) {
      return;
    }
    // TODO: worth changing to an await transation model
    for (const transaction of Object.values(transactionMap)) {
      if (transaction.status === 'in-progress') {
        provider
          .getTransactionReceipt(transaction.hash)
          .then((receipt) => {
            if (receipt) {
              updateTransactionMap((draft) => {
                draft[transaction.hash].lastBlockNumChecked = blockNumber;
                draft[transaction.hash].receipt = receipt;
                draft[transaction.hash].status =
                  receipt.status === 1 ? 'success' : 'failed';
              });
              addTxToast(
                transaction.hash,
                blockNumber,
                receipt.status === 1 ? 'success' : 'failed',
              );
            } else {
              updateTransactionMap((draft) => {
                draft[transaction.hash].lastBlockNumChecked = blockNumber;
              });
            }
          })
          .catch((error) => {
            console.error(
              `failed to check transaction hash: ${transaction.hash}`,
              error,
            );
          });
      }
    }
  }, [provider, blockNumber, account, chainId]);

  return <></>;
};
