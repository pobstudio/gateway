import { task } from 'hardhat/config';
import { BigNumber, Signer } from 'ethers';
import { ERC1155Mintable } from '../typechain/ERC1155Mintable';
import { POBMinter } from '../typechain/POBMinter';
import { deployments } from '../deployments';
import { ETH_IN_WEI, NETWORK_NAME_CHAIN_ID } from '../utils';

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

task('update-metadata', 'Updates contract and token URI', async (args, hre) => {
  const owner = (await hre.ethers.getSigners())[0];

  const startingPrice = ETH_IN_WEI.mul(0.0);
  const pricePerMint = ETH_IN_WEI.div(1 / 0.02);
  const maxMintingSupply = BigNumber.from(1000);

  await hre.run('compile');

  console.log(`deploying with ${await owner.getAddress()}`);

  // create erc1155
  const ERC1155Mintable = await hre.ethers.getContractFactory(
    'ERC1155Mintable',
  );
  const erc1155 = ERC1155Mintable.attach(
    deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].erc1155,
  ) as ERC1155Mintable;

  // await erc1155.setContractURI(`https://pob.studio/api/contract-metadata`);
  await erc1155.setBaseMetadataURI(
    `https://pob.studio/api/token-metadata?id=0x`,
  );
  console.log('Metadata set.');
});
