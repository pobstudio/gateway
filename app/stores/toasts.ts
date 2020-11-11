import create from 'zustand';
import produce from 'immer';

export const MAX_TOAST_LIFE = 15;

export type ToastStatus = 'success' | 'failed';

export type ToastType = 'transaction' | 'status';

export interface ToastObject {
  id: string;
  blockAdded: number;
  type: ToastType;
  isDismissed: boolean;
  metadata: any;
}

export type ToastMap = { [hash: string]: ToastObject };

type State = {
  toastMap: ToastMap;
  updateToastMap: (updateFn: (update: any) => void) => void;
  addTxToast: (hash: string, blockAdded: number, status: ToastStatus) => void;
  addStatusToast: (statusId: string, blockAdded: number, metadata: any) => void;
  dismissToast: (id: string) => void;
};

export const useToastsStore = create<State>((set, get) => ({
  toastMap: {},
  updateToastMap: (updateFn: (update: any) => void) => {
    set(
      produce((update) => {
        updateFn(update.toastMap);
      }),
    );
  },
  addTxToast: (hash: string, blockAdded: number, status: ToastStatus) => {
    get().updateToastMap((u) => {
      u[hash] = {
        metadata: {
          hash,
          status,
        },
        blockAdded,
        type: 'transaction',
        isDismissed: false,
        id: hash,
      } as ToastObject;
    });
  },
  addStatusToast: (statusId: string, blockAdded: number, metadata: any) => {
    get().updateToastMap((u) => {
      u[statusId] = {
        metadata,
        blockAdded,
        type: 'status',
        isDismissed: false,
        id: statusId,
      } as ToastObject;
    });
  },
  dismissToast: (id: string) => {
    get().updateToastMap((u) => {
      if (!u[id]) {
        return;
      }
      u[id].isDismissed = true;
    });
  },
}));
