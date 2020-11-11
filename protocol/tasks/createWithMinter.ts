import { task } from 'hardhat/config';
import { BigNumber, Signer } from 'ethers';
import { ERC1155Mintable } from '../typechain/ERC1155Mintable';
import { POBMinterV2 } from '../typechain/POBMinterV2';
import { deployments } from '../deployments';
import { ETH_IN_WEI, NETWORK_NAME_CHAIN_ID } from '../utils';

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

task(
  'mint-nf',
  'Deploys NF token and adds a linear minter',
  async (args, hre) => {
    const owner = (await hre.ethers.getSigners())[0];

    const startingPrice = hre.ethers.utils.parseEther('0.05');
    const pricePerMint = hre.ethers.utils.parseEther('0.001');
    const flatPriceUpTo = 1000;

    await hre.run('compile');

    console.log(`deploying with ${await owner.getAddress()}`);

    // create erc1155
    const ERC1155Mintable = await hre.ethers.getContractFactory(
      'ERC1155Mintable',
    );
    const erc1155 = ERC1155Mintable.attach(
      deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].erc1155,
    ) as ERC1155Mintable;

    const logs = (await (await erc1155.connect(owner).create(true)).wait())
      .logs;

    const [tokenType] = hre.ethers.utils.defaultAbiCoder.decode(
      ['uint256', 'uint256'],
      logs[0].data,
    );

    console.log(`created tokenType: ${(tokenType as BigNumber).toHexString()}`);

    // deploy linear minter
    const POBMinterV2 = await hre.ethers.getContractFactory('POBMinterV2');

    const pobMinter = (await POBMinterV2.deploy(
      deployments[NETWORK_NAME_CHAIN_ID[hre.network.name]].pobMinter,
      erc1155.address,
      await owner.getAddress(),
      tokenType,
      startingPrice,
      pricePerMint,
      flatPriceUpTo,
    )) as POBMinterV2;
    await pobMinter.deployed();
    console.log('POBMinterV2 deployed to:', pobMinter.address);

    await erc1155
      .connect(owner)
      .setCreatorApproval(tokenType, pobMinter.address, true);
    console.log('POBMinterV2 approved to mint.');

    // await erc1155
    //   .connect(owner)
    //   .setCreatorApproval(tokenType, await owner.getAddress(), false);
    // console.log('Owner revoked from minting.');
  },
);
