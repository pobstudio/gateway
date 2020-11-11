import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { ERC1155Mintable } from '../typechain/ERC1155Mintable';
import { RejectingTreasury } from '../typechain/RejectingTreasury';
import { POBMinter } from '../typechain/POBMinter';
import { expect } from 'chai';

const TYPE_NF_0 =
  '0x8000000000000000000000000000000100000000000000000000000000000000';

const RANDOM_TX_HASH = ['0x1', '0x2', '0x3', '0x4', '0x5', '0x6', '0x7'];

describe('RejectingTreasury', function () {
  let erc1155Mintable: ERC1155Mintable;
  let rejectingTreasury: RejectingTreasury;

  let pobMinter: POBMinter;
  let owner: Signer;
  let secondaryTreasury: Signer;
  let rando: Signer;

  // curve params
  const startingPrice = BigNumber.from(100);
  const pricePerMint = BigNumber.from(100);
  // const maxMintingSupply = BigNumber.from(6);
  const tokenType = TYPE_NF_0;

  before(async function () {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    secondaryTreasury = accounts[1];
    rando = accounts[2];
  });

  beforeEach(async () => {
    const ERC1155TokenMintable = await ethers.getContractFactory(
      'ERC1155Mintable',
    );
    erc1155Mintable = (await ERC1155TokenMintable.deploy()) as ERC1155Mintable;
    await erc1155Mintable.deployed();
    const RejectingTreasury = await ethers.getContractFactory(
      'RejectingTreasury',
    );
    rejectingTreasury = (await RejectingTreasury.deploy()) as RejectingTreasury;
    await erc1155Mintable.deployed();
    const POBMinter = await ethers.getContractFactory('POBMinter');
    pobMinter = (await POBMinter.deploy(
      erc1155Mintable.address,
      await owner.getAddress(),
      tokenType,
      startingPrice,
      pricePerMint,
      // maxMintingSupply,
    )) as POBMinter;
    await pobMinter.deployed();
  });

  describe('minting permissions', () => {
    const NF_ID_1 = BigNumber.from(TYPE_NF_0).or(1);
    const BALANCE = BigNumber.from(1);
    beforeEach(async () => {
      await erc1155Mintable.connect(owner).create(true);
      await erc1155Mintable.setCreatorApproval(
        TYPE_NF_0,
        pobMinter.address,
        true,
      );
    });

    it('should not allow minting if treasury set to RejectingTreasury', async function () {
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
          value: startingPrice,
        });
      expect(
        await erc1155Mintable.balanceOf(await rando.getAddress(), NF_ID_1),
      ).to.eq(BALANCE);
      await pobMinter.connect(owner).setTreasury(rejectingTreasury.address);

      await expect(
        pobMinter
          .connect(rando)
          .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
            value: startingPrice.add(pricePerMint),
          }),
      ).to.reverted;
    });
  });
});
