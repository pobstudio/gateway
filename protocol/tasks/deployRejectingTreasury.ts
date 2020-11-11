import { task } from 'hardhat/config';
import { RejectingTreasury } from '../typechain/RejectingTreasury';
import { POBMinter } from '../typechain/POBMinter';
import { deployments } from '../deployments';
import { ETH_IN_WEI, NETWORK_NAME_CHAIN_ID } from '../utils';

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task(
  'deploy-rejecting-treasury',
  'Deploys rejecting treasury',
  async (args, hre) => {
    const owner = (await hre.ethers.getSigners())[0];

    await hre.run('compile');

    console.log(`deploying with ${await owner.getAddress()}`);

    // deploy erc1155
    const POBMinter = await hre.ethers.getContractFactory('POBMinter');
    const minter = POBMinter.attach(
      deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].pobMinter,
    ) as POBMinter;

    const RejectingTreasury = await hre.ethers.getContractFactory(
      'RejectingTreasury',
    );
    const rejectingTreasury = await RejectingTreasury.deploy();
    await rejectingTreasury.deployed();
    console.log('RejectingTreasury deployed to:', rejectingTreasury.address);

    await minter.setTreasury(rejectingTreasury.address);
    console.log('RejectingTreasury set.');
  },
);
