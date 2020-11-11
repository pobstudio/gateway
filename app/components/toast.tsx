import { useMemo } from 'react';
import { useCallback } from 'react';
import { FC } from 'react';
import { useTransition, animated } from 'react-spring';
import styled from 'styled-components';
import { HEADER_HEIGHT, MOBILE_HEADER_HEIGHT } from '../constants';
import { useTokenId } from '../hooks/useTokenId';
import { useModalStore } from '../stores/modal';
import { ToastObject, useToastsStore } from '../stores/toasts';
import { useTransactionsStore } from '../stores/transaction';
import { BREAKPTS } from '../styles';
import { getEditionFromTokenId } from '../utils/token';
import { BaseButton } from './button';
import { CloseIcon } from './icons/close';

const TRANSACTION_TOAST_HEIGHT = 42;
const STATUS_TOAST_HEIGHT = 82;

const ToastsContainer = styled.div`
  z-index: 9998;
  position: absolute;
  top: ${HEADER_HEIGHT}px;
  right: 16px;
  display: grid;
  grid-gap: 0px;
  grid-template-columns: 1fr;
  div + div {
    margin-top: 10px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    top: ${MOBILE_HEADER_HEIGHT}px;
  }
`;

const ToastContainer = styled.div`
  background: #000;
  height: ${TRANSACTION_TOAST_HEIGHT}px;
  width: 250px;
  display: flex;
  position: relative;
  overflow: hidden;
`;

const ToastContentContainer = styled.div`
  padding: 0 12px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  position: absolute;
`;

const AToastContainer = animated(ToastContainer);

const ToastText = styled.p`
  font-weight: bold;
  color: white;
  margin: 0;
  text-align: left;
`;

const XIcon = styled(CloseIcon)`
  width: 18px;
  height: 18px;
  display: block;
  * {
    fill: #ffffff;
  }
`;

const StatusToast: FC<
  ToastObject & { dismiss: () => void; springStyle?: any }
> = ({ id, dismiss, springStyle, metadata }) => {
  return (
    <AToastContainer style={springStyle}>
      <ToastContentContainer>
        <BaseButton
          onClick={() => {
            dismiss();
          }}
        >
          <ToastText style={{ width: 150 }}>{metadata.text}</ToastText>
        </BaseButton>
        <BaseButton onClick={dismiss}>
          <XIcon />
        </BaseButton>
      </ToastContentContainer>
    </AToastContainer>
  );
};

const SuccessTxToast: FC<
  ToastObject & { dismiss: () => void; springStyle?: any }
> = ({ id, dismiss, springStyle }) => {
  const tokenId = useTokenId(id);
  const tx = useTransactionsStore(
    useCallback((s) => s.transactionMap[id], [id]),
  );
  const toggleWalletModal = useModalStore((s) => s.toggleIsWalletModalOpen);

  return (
    <AToastContainer style={{ ...springStyle }}>
      <ToastContentContainer>
        <BaseButton
          onClick={() => {
            toggleWalletModal();
            dismiss();
          }}
        >
          <ToastText>
            NO.{' '}
            {!!tokenId && tokenId !== '0x00'
              ? getEditionFromTokenId(tokenId)
              : tx.metadata.attemptedEdition}{' '}
            MINTED
          </ToastText>
        </BaseButton>
        <BaseButton onClick={dismiss}>
          <XIcon />
        </BaseButton>
      </ToastContentContainer>
    </AToastContainer>
  );
};

const FailedTxToast: FC<
  ToastObject & { dismiss: () => void; springStyle?: any }
> = ({ springStyle, id, dismiss }) => {
  const tx = useTransactionsStore(
    useCallback((s) => s.transactionMap[id], [id]),
  );
  const toggleWalletModal = useModalStore((s) => s.toggleIsWalletModalOpen);

  return (
    <AToastContainer style={springStyle}>
      <ToastContentContainer>
        <BaseButton
          onClick={() => {
            toggleWalletModal();
            dismiss();
          }}
        >
          <ToastText>NO. {tx.metadata.attemptedEdition} FAILED</ToastText>
        </BaseButton>
        <BaseButton onClick={dismiss}>
          <XIcon />
        </BaseButton>
      </ToastContentContainer>
    </AToastContainer>
  );
};

const Toast: FC<
  ToastObject & { dismiss: (hash: string) => void; springStyle?: any }
> = (props) => {
  const { dismiss, ...toast } = props;
  const onDismiss = useCallback(() => dismiss(toast.id), []);

  return (
    <>
      {toast.type === 'status' && (
        <StatusToast {...toast} dismiss={onDismiss} />
      )}
      {toast.type === 'transaction' && toast.metadata.status === 'failed' && (
        <FailedTxToast {...toast} dismiss={onDismiss} />
      )}
      {toast.type === 'transaction' && toast.metadata.status === 'success' && (
        <SuccessTxToast {...toast} dismiss={onDismiss} />
      )}
    </>
  );
};

export const Toasts: FC = () => {
  const toasts = useToastsStore((s) => s.toastMap);
  const dismiss = useToastsStore((s) => s.dismissToast);

  const showableToasts = useMemo(() => {
    return Object.values(toasts).filter((t) => !t.isDismissed);
  }, [toasts]);

  const transitions = useTransition(
    showableToasts,
    (item) => `${item.id}-${item.blockAdded}`,
    {
      from: { opacity: 0, height: 0, marginTop: 0 },
      enter: (item: any) => async (next: any) => {
        await next({
          height:
            item.type === 'transaction'
              ? TRANSACTION_TOAST_HEIGHT
              : STATUS_TOAST_HEIGHT,
          marginTop: 10,
        });
        await next({ opacity: 1 });
      },
      leave: (item: any) => async (next: any) => {
        await next({ opacity: 0 });
        await next({ height: 0, marginTop: 0 });
      },
    } as any,
  );

  return (
    <ToastsContainer>
      {transitions.map(({ key, props, item }) => {
        return (
          <Toast {...item} key={key} springStyle={props} dismiss={dismiss} />
        );
      })}
    </ToastsContainer>
  );
};
