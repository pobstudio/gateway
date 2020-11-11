import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { ERC1155Mintable } from '../typechain/ERC1155Mintable';
import { POBMinter } from '../typechain/POBMinter';
import { POBMinterV2 } from '../typechain/POBMinterV2';
import { expect } from 'chai';

const TYPE_NF_0 =
  '0x8000000000000000000000000000000100000000000000000000000000000000';
const TYPE_NF_1 =
  '0x8000000000000000000000000000000200000000000000000000000000000000';

const RANDOM_TX_HASH = ['0x1', '0x2', '0x3', '0x4', '0x5', '0x6', '0x7'];

describe('POBMinterV2', function () {
  let erc1155Mintable: ERC1155Mintable;
  let pobMinter: POBMinterV2;
  let pobMinterV1: POBMinter;

  let owner: Signer;
  let secondaryTreasury: Signer;
  let rando: Signer;

  // curve params
  const startingPrice = BigNumber.from(100);
  const pricePerMint = BigNumber.from(100);
  const flatPriceUpTo = BigNumber.from(4);

  // const maxMintingSupply = BigNumber.from(6);

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
    const POBMinterV1 = await ethers.getContractFactory('POBMinter');
    pobMinterV1 = (await POBMinterV1.deploy(
      erc1155Mintable.address,
      await owner.getAddress(),
      TYPE_NF_0,
      startingPrice,
      pricePerMint,
    )) as POBMinter;
    await pobMinterV1.deployed();
    const POBMinterV2 = await ethers.getContractFactory('POBMinterV2');
    pobMinter = (await POBMinterV2.deploy(
      pobMinterV1.address,
      erc1155Mintable.address,
      await owner.getAddress(),
      TYPE_NF_1,
      startingPrice,
      pricePerMint,
      flatPriceUpTo,
    )) as POBMinterV2;
    await pobMinter.deployed();
  });

  describe('setTreasury', () => {
    it('should set new treasury address', async function () {
      await pobMinter
        .connect(owner)
        .setTreasury(await secondaryTreasury.getAddress());
      expect(await pobMinter.treasury()).to.eq(
        await secondaryTreasury.getAddress(),
      );
    });
    it('should not set new treasury address by rando', async function () {
      await expect(
        pobMinter
          .connect(rando)
          .setTreasury(await secondaryTreasury.getAddress()),
      ).to.reverted;
    });
  });

  describe('minting permissions', () => {
    const NF_ID_1 = BigNumber.from(TYPE_NF_1).or(1);
    const BALANCE = BigNumber.from(1);
    beforeEach(async () => {
      await erc1155Mintable.connect(owner).create(true);
      await erc1155Mintable.setCreatorApproval(
        TYPE_NF_0,
        pobMinterV1.address,
        true,
      );
      await erc1155Mintable.connect(owner).create(true);
    });

    it('should not allow minting if creatorApproval not granted', async function () {
      await expect(
        pobMinter
          .connect(rando)
          .mint(await rando.getAddress(), RANDOM_TX_HASH[0]),
      ).to.reverted;
    });

    it('should allow minting if creatorApproval is granted', async function () {
      await erc1155Mintable.setCreatorApproval(
        TYPE_NF_1,
        pobMinter.address,
        true,
      );
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
          value: startingPrice,
        });
      expect(
        await erc1155Mintable.balanceOf(await rando.getAddress(), NF_ID_1),
      ).to.eq(BALANCE);
    });
  });

  describe('maxIndex', () => {
    beforeEach(async () => {
      await erc1155Mintable.connect(owner).create(true);
      await erc1155Mintable.setCreatorApproval(
        TYPE_NF_0,
        pobMinterV1.address,
        true,
      );
      await erc1155Mintable.connect(owner).create(true);
      await erc1155Mintable.setCreatorApproval(
        TYPE_NF_1,
        pobMinter.address,
        true,
      );
    });

    it('maxIndex should be aggregative of both token types', async function () {
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
          value: startingPrice,
        });
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[1], {
          value: startingPrice,
        });
      await pobMinterV1
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[2], {
          value: startingPrice,
        });
      expect(await pobMinter.maxIndex()).to.eq(BigNumber.from(3));
    });
  });

  describe('minting curve', () => {
    const NF_ID_1 = BigNumber.from(TYPE_NF_1).or(1);
    const NF_ID_2 = BigNumber.from(TYPE_NF_1).or(2);
    const NF_ID_3 = BigNumber.from(TYPE_NF_1).or(3);
    const NF_ID_4 = BigNumber.from(TYPE_NF_1).or(4);
    const NF_ID_5 = BigNumber.from(TYPE_NF_1).or(5);
    const NF_ID_6 = BigNumber.from(TYPE_NF_1).or(6);
    const NF_ID_7 = BigNumber.from(TYPE_NF_1).or(7);

    const BALANCE = BigNumber.from(1);

    beforeEach(async () => {
      await erc1155Mintable.connect(owner).create(true);
      await erc1155Mintable.setCreatorApproval(
        TYPE_NF_0,
        pobMinterV1.address,
        true,
      );
      await erc1155Mintable.connect(owner).create(true);
      await erc1155Mintable.setCreatorApproval(
        TYPE_NF_1,
        pobMinter.address,
        true,
      );
    });

    it('should allow flatPriceUpTo to be priced at startingPrice', async function () {
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
          value: startingPrice,
        });
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[1], {
          value: startingPrice,
        });
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[2], {
          value: startingPrice,
        });
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[3], {
          value: startingPrice,
        });
      expect(
        await erc1155Mintable.balanceOf(await rando.getAddress(), NF_ID_4),
      ).to.eq(BALANCE);
    });

    it('should allow x mint to be priced at startingPrice + ((supply - flatPriceUpTo) * rate)', async function () {
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
          value: startingPrice,
        });
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[1], {
          value: startingPrice,
        });
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[2], {
          value: startingPrice,
        });
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[3], {
          value: startingPrice,
        });
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[4], {
          value: startingPrice,
        });
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[5], {
          value: startingPrice.add(pricePerMint.mul(1)),
        });
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[6], {
          value: startingPrice.add(pricePerMint.mul(2)),
        });
      expect(
        await erc1155Mintable.balanceOf(await rando.getAddress(), NF_ID_7),
      ).to.eq(BALANCE);
    });

    it('should not allow first mint to be priced under startingPrice', async function () {
      await expect(
        pobMinter
          .connect(rando)
          .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
            value: startingPrice.sub(1),
          }),
      ).to.revertedWith('insufficient funds to pay for mint');
    });

    it('should not allow x mint to be priced under startingPrice + (supply * rate)', async function () {
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
          value: startingPrice,
        });
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[1], {
          value: startingPrice,
        });
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[2], {
          value: startingPrice,
        });
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[3], {
          value: startingPrice,
        });
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[4], {
          value: startingPrice,
        });
      await expect(
        pobMinter
          .connect(rando)
          .mint(await rando.getAddress(), RANDOM_TX_HASH[5], {
            value: startingPrice.add(pricePerMint.mul(1)).sub(1),
          }),
      ).to.revertedWith('insufficient funds to pay for mint');
    });
  });

  // describe('max minting supply', () => {
  //   beforeEach(async () => {
  //     await erc1155Mintable.connect(owner).create(true);
  //     await erc1155Mintable.setCreatorApproval(
  //       TYPE_NF_0,
  //       pobMinter.address,
  //       true,
  //     );
  //   });

  //   it('should not allow minting if exceeds max supply', async function () {
  //     await pobMinter
  //       .connect(rando)
  //       .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
  //         value: startingPrice,
  //       });
  //     await pobMinter
  //       .connect(rando)
  //       .mint(await rando.getAddress(), RANDOM_TX_HASH[1], {
  //         value: startingPrice.add(pricePerMint.mul(1)),
  //       });
  //     await pobMinter
  //       .connect(rando)
  //       .mint(await rando.getAddress(), RANDOM_TX_HASH[2], {
  //         value: startingPrice.add(pricePerMint.mul(2)),
  //       });
  //     await pobMinter
  //       .connect(rando)
  //       .mint(await rando.getAddress(), RANDOM_TX_HASH[3], {
  //         value: startingPrice.add(pricePerMint.mul(3)),
  //       });
  //     await pobMinter
  //       .connect(rando)
  //       .mint(await rando.getAddress(), RANDOM_TX_HASH[4], {
  //         value: startingPrice.add(pricePerMint.mul(4)),
  //       });
  //     await pobMinter
  //       .connect(rando)
  //       .mint(await rando.getAddress(), RANDOM_TX_HASH[5], {
  //         value: startingPrice.add(pricePerMint.mul(5)),
  //       });

  //     await expect(
  //       pobMinter
  //         .connect(rando)
  //         .mint(await rando.getAddress(), RANDOM_TX_HASH[6], {
  //           value: startingPrice.add(pricePerMint.mul(6)),
  //         }),
  //     ).to.revertedWith('max supply minted');
  //   });
  // });

  describe('txhash registry', () => {
    beforeEach(async () => {
      await erc1155Mintable.connect(owner).create(true);
      await erc1155Mintable.setCreatorApproval(
        TYPE_NF_0,
        pobMinterV1.address,
        true,
      );
      await erc1155Mintable.connect(owner).create(true);
      await erc1155Mintable.setCreatorApproval(
        TYPE_NF_1,
        pobMinter.address,
        true,
      );
    });

    it('should not allow minting if txhash already minted', async function () {
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
          value: startingPrice,
        });
      await expect(
        pobMinter
          .connect(rando)
          .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
            value: startingPrice.add(pricePerMint.mul(1)),
          }),
      ).to.revertedWith('txHash already exists');
    });

    it('should not allow minting if txhash already minted in v1', async function () {
      await pobMinterV1
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
          value: startingPrice,
        });
      await expect(
        pobMinter
          .connect(rando)
          .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
            value: startingPrice,
          }),
      ).to.revertedWith('txHash already exists');
    });

    it('should provide valid mapping of registry', async function () {
      const NF_ID_1 = BigNumber.from(TYPE_NF_1).or(1);
      const NF_ID_2 = BigNumber.from(TYPE_NF_1).or(2);

      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
          value: startingPrice,
        });

      expect(await pobMinter.tokenIdToTxHash(NF_ID_1)).to.deep.eq(
        BigNumber.from(RANDOM_TX_HASH[0]),
      );
      expect(await pobMinter.txHashToTokenId(RANDOM_TX_HASH[0])).to.deep.eq(
        NF_ID_1,
      );

      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[1], {
          value: startingPrice.add(pricePerMint.mul(1)),
        });

      expect(await pobMinter.tokenIdToTxHash(NF_ID_2)).to.deep.eq(
        BigNumber.from(RANDOM_TX_HASH[1]),
      );
      expect(await pobMinter.txHashToTokenId(RANDOM_TX_HASH[1])).to.deep.eq(
        NF_ID_2,
      );
    });
  });

  describe('mint', async () => {
    beforeEach(async () => {
      await erc1155Mintable.connect(owner).create(true);
      await erc1155Mintable.setCreatorApproval(
        TYPE_NF_0,
        pobMinterV1.address,
        true,
      );
      await erc1155Mintable.connect(owner).create(true);
      await erc1155Mintable.setCreatorApproval(
        TYPE_NF_1,
        pobMinter.address,
        true,
      );
    });

    it('should transfer to treasury value', async function () {
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
          value: startingPrice,
        });
      const beforeBalance = await owner.getBalance();
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[1], {
          value: startingPrice,
        });
      const afterBalance = await owner.getBalance();
      expect(afterBalance.sub(beforeBalance)).to.deep.eq(startingPrice);
    });
    it('should transfer to treasury value and excess back to sender', async function () {
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[0], {
          value: startingPrice,
        });
      const beforeBalance = await owner.getBalance();
      await pobMinter
        .connect(rando)
        .mint(await rando.getAddress(), RANDOM_TX_HASH[1], {
          value: startingPrice.add(pricePerMint.mul(2)),
        });
      const afterBalance = await owner.getBalance();
      expect(afterBalance.sub(beforeBalance)).to.deep.eq(startingPrice);
      expect(await ethers.provider.getBalance(pobMinter.address)).to.deep.eq(
        BigNumber.from(0),
      );
    });
  });
});
