import { task } from 'hardhat/config';
import { BigNumber, Signer } from 'ethers';
import { POBMinter } from '../typechain/POBMinter';
import { deployments } from '../deployments';
import { ETH_IN_WEI, NETWORK_NAME_CHAIN_ID } from '../utils';

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

task('update-treasury', 'Updates treasury address', async (args, hre) => {
  const owner = (await hre.ethers.getSigners())[0];

  await hre.run('compile');

  console.log(`deploying with ${await owner.getAddress()}`);

  // create erc1155
  const POBMinter = await hre.ethers.getContractFactory('POBMinter');
  const minter = POBMinter.attach(
    deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].pobMinter,
  ) as POBMinter;

  await minter.setTreasury(`0xcc5Ddc8CCD5B1E90Bc42F998ec864Ead0090A12B`);
  console.log('Treasury set.');
});
