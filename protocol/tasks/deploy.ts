import { task } from 'hardhat/config';
import { ERC1155Mintable } from '../typechain/ERC1155Mintable';

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('deploy', 'Deploys contracts', async (args, hre) => {
  const owner = (await hre.ethers.getSigners())[0];

  await hre.run('compile');

  console.log(`deploying with ${await owner.getAddress()}`);

  // deploy erc1155
  const ERC1155Mintable = await hre.ethers.getContractFactory(
    'ERC1155Mintable',
  );
  const erc1155 = (await ERC1155Mintable.deploy()) as ERC1155Mintable;
  await erc1155.deployed();
  console.log('ERC1155Mintable deployed to:', erc1155.address);

  // deploy exchange registry
  const WhitelistExchangesProxy = await hre.ethers.getContractFactory(
    'WhitelistExchangesProxy',
  );
  const whitelistProxy = await WhitelistExchangesProxy.deploy();
  await whitelistProxy.deployed();
  console.log('WhitelistExchangesProxy deployed to:', whitelistProxy.address);

  // TODO: utilize exchange proxy

  await erc1155.setContractURI(`https://pob.studio/api/contract-metadata`);
  await erc1155.setBaseMetadataURI(
    `https://pob.studio/api/token-metadata?id=0x`,
  );

  // checks
  const INTERFACE_SIGNATURE_ERC165 = '0x01ffc9a7';
  const INTERFACE_SIGNATURE_ERC1155 = '0xd9b67a26';

  const isERC165Supported = await erc1155.supportsInterface(
    INTERFACE_SIGNATURE_ERC165,
  );
  const isERC1155Supported = await erc1155.supportsInterface(
    INTERFACE_SIGNATURE_ERC1155,
  );

  console.log('Interface check: ');
  console.log('ERC165:', isERC165Supported);
  console.log('ERC1155:', isERC1155Supported);
});
