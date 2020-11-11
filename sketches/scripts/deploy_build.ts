require('dotenv').config();

import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber, ethers, Wallet } from 'ethers';
import { promises } from 'fs';
import { resolve } from 'path';

const readFile = promises.readFile;
const DIST_FILE_PATH = resolve(__dirname, '..', 'lib', 'dist', 'index.js');

const RPC_URL: string = process.env.NETWORK_RPC_URL ?? '';
const MNEMONIC: string | undefined = process.env.MNEMONIC;
const PRIVATE_KEY: string | undefined = process.env.PRIVATE_KEY;

const GWEI = BigNumber.from('1000000000');
const CHAIN_ID = 1;

const provider = new JsonRpcProvider(RPC_URL, CHAIN_ID);
const signer = !!MNEMONIC
  ? Wallet.fromMnemonic(MNEMONIC)
  : new Wallet(PRIVATE_KEY ?? '');
const signerWithProvider = signer.connect(provider);

(async () => {
  const bytes = await readFile(DIST_FILE_PATH);
  await signerWithProvider.sendTransaction({
    from: await signerWithProvider.getAddress(),
    to: await signerWithProvider.getAddress(),
    value: 0,
    gasPrice: GWEI.mul(48),
    data: ethers.utils.hexlify(bytes),
  });
})();
