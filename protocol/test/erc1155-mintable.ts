import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { ERC1155Mintable } from '../typechain/ERC1155Mintable';
import { DummyERC1155Receiver } from '../typechain/DummyERC1155Receiver';
import { expect } from 'chai';

const TYPE_F_0 =
  '0x0000000000000000000000000000000100000000000000000000000000000000';
const TYPE_F_1 =
  '0x0000000000000000000000000000000200000000000000000000000000000000';
const TYPE_NF_0 =
  '0x8000000000000000000000000000000100000000000000000000000000000000';
const TYPE_NF_1 =
  '0x8000000000000000000000000000000200000000000000000000000000000000';

describe('ERC1155TokenMintable', function () {
  let erc1155Mintable: ERC1155Mintable;
  let dummyErc1155Receiver: DummyERC1155Receiver;
  let owner: Signer;
  let secondaryCreator: Signer;
  let rando: Signer;
  before(async function () {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    secondaryCreator = accounts[1];
    rando = accounts[2];
  });

  beforeEach(async () => {
    const ERC1155TokenMintable = await ethers.getContractFactory(
      'ERC1155Mintable',
    );
    erc1155Mintable = (await ERC1155TokenMintable.deploy()) as ERC1155Mintable;
    await erc1155Mintable.deployed();
    const DummyERC1155Receiver = await ethers.getContractFactory(
      'DummyERC1155Receiver',
    );
    dummyErc1155Receiver = (await DummyERC1155Receiver.deploy()) as DummyERC1155Receiver;
    await dummyErc1155Receiver.deployed();
  });

  describe('create', function () {
    it('should create nonfungible token with the right type', async function () {
      const createRes0 = await erc1155Mintable.connect(owner).create(false);
      const receipt0 = await createRes0.wait();
      expect(receipt0.logs[0].data.startsWith(TYPE_F_0));
      const createRes1 = await erc1155Mintable.connect(owner).create(false);
      const receipt1 = await createRes1.wait();
      expect(receipt1.logs[0].data.startsWith(TYPE_F_1));
    });
    it('should create fungible token with the right type', async function () {
      const createRes0 = await erc1155Mintable.connect(owner).create(true);
      const receipt0 = await createRes0.wait();
      expect(receipt0.logs[0].data.startsWith(TYPE_NF_0));
      const createRes1 = await erc1155Mintable.connect(owner).create(true);
      const receipt1 = await createRes1.wait();
      expect(receipt1.logs[0].data.startsWith(TYPE_NF_1));
    });
    it('should not create if not called from owner', async function () {
      await expect(erc1155Mintable.connect(rando).create(true)).to.be.reverted;
    });
  });

  describe('createWithType', function () {
    // TODO
    it('should not create if not called from owner', async function () {
      await expect(erc1155Mintable.connect(rando).createWithType(TYPE_F_0)).to
        .be.reverted;
    });
  });

  describe('mintFungible', function () {
    const BALANCE = BigNumber.from(100);

    beforeEach(async () => {
      await erc1155Mintable.connect(owner).create(false);
    });

    it('should mint tokens for fungible type', async function () {
      await erc1155Mintable
        .connect(owner)
        .mintFungible(
          TYPE_F_0,
          [await secondaryCreator.getAddress(), await rando.getAddress()],
          [BALANCE, BALANCE],
        );
      expect(
        await erc1155Mintable.balanceOf(
          await secondaryCreator.getAddress(),
          TYPE_F_0,
        ),
      ).to.deep.eq(BALANCE);
      expect(
        await erc1155Mintable.balanceOf(await rando.getAddress(), TYPE_F_0),
      ).to.deep.eq(BALANCE);
    });
    it('should not mint tokens for nonfungible type', async function () {
      await erc1155Mintable.connect(owner).create(true);
      await expect(
        erc1155Mintable
          .connect(owner)
          .mintFungible(
            TYPE_NF_0,
            [await secondaryCreator.getAddress(), await rando.getAddress()],
            [BALANCE, BALANCE],
          ),
      ).to.be.reverted;
    });
    it('should not mint tokens for non creator', async function () {
      await expect(
        erc1155Mintable
          .connect(rando)
          .mintFungible(
            TYPE_F_0,
            [await secondaryCreator.getAddress(), await rando.getAddress()],
            [BALANCE, BALANCE],
          ),
      ).to.be.reverted;
    });
  });

  describe('mintNonFungible', function () {
    const NF_ID_1 = BigNumber.from(TYPE_NF_0).or(1);
    const NF_ID_2 = BigNumber.from(TYPE_NF_0).or(2);
    const BALANCE = BigNumber.from(1);

    beforeEach(async () => {
      await erc1155Mintable.connect(owner).create(true);
    });
    it('should mint tokens for notfungible type', async function () {
      await erc1155Mintable
        .connect(owner)
        .mintNonFungible(TYPE_NF_0, [
          await secondaryCreator.getAddress(),
          await rando.getAddress(),
        ]);
      expect(
        await erc1155Mintable.balanceOf(
          await secondaryCreator.getAddress(),
          NF_ID_1,
        ),
      ).to.deep.eq(BALANCE);
      expect(
        await erc1155Mintable.balanceOf(await rando.getAddress(), NF_ID_2),
      ).to.deep.eq(BALANCE);
    });
    it('should not mint tokens for fungible type', async function () {
      await erc1155Mintable.connect(owner).create(false);
      await expect(
        erc1155Mintable
          .connect(owner)
          .mintNonFungible(TYPE_F_0, [
            await secondaryCreator.getAddress(),
            await rando.getAddress(),
          ]),
      ).to.be.reverted;
    });
    it('should not mint tokens for non creator', async function () {
      await expect(
        erc1155Mintable
          .connect(rando)
          .mintNonFungible(TYPE_NF_0, [
            await secondaryCreator.getAddress(),
            await rando.getAddress(),
          ]),
      ).to.be.reverted;
    });
  });

  describe('setCreatorApproval', function () {
    const NF_ID_1 = BigNumber.from(TYPE_NF_0).or(1);
    const NF_ID_2 = BigNumber.from(TYPE_NF_0).or(2);
    const BALANCE = BigNumber.from(1);

    beforeEach(async () => {
      await erc1155Mintable.connect(owner).create(true);
    });

    it('should creator set new creator approvals', async function () {
      await erc1155Mintable
        .connect(owner)
        .setCreatorApproval(
          TYPE_NF_0,
          await secondaryCreator.getAddress(),
          true,
        );
      await erc1155Mintable
        .connect(secondaryCreator)
        .mintNonFungible(TYPE_NF_0, [await rando.getAddress()]);
      expect(
        await erc1155Mintable.balanceOf(await rando.getAddress(), NF_ID_1),
      ).to.deep.eq(BALANCE);
    });

    it('should creator self revoke access', async function () {
      await erc1155Mintable
        .connect(owner)
        .setCreatorApproval(TYPE_NF_0, await owner.getAddress(), false);
      await expect(
        erc1155Mintable
          .connect(owner)
          .mintNonFungible(TYPE_NF_0, [await rando.getAddress()]),
      ).to.revertedWith('not an approved creator of id');
    });

    it('should not rando set new creator approvals', async function () {
      await expect(
        erc1155Mintable
          .connect(rando)
          .setCreatorApproval(
            TYPE_NF_0,
            await secondaryCreator.getAddress(),
            true,
          ),
      ).to.revertedWith('not an approved creator of id');
    });

    it('should new creator mint revert after set new creator revoked', async function () {
      await erc1155Mintable
        .connect(owner)
        .setCreatorApproval(
          TYPE_NF_0,
          await secondaryCreator.getAddress(),
          true,
        );
      await erc1155Mintable
        .connect(secondaryCreator)
        .mintNonFungible(TYPE_NF_0, [await rando.getAddress()]);
      expect(
        await erc1155Mintable.balanceOf(await rando.getAddress(), NF_ID_1),
      ).to.deep.eq(BALANCE);
      await erc1155Mintable
        .connect(owner)
        .setCreatorApproval(
          TYPE_NF_0,
          await secondaryCreator.getAddress(),
          false,
        );
      await expect(
        erc1155Mintable
          .connect(secondaryCreator)
          .mintNonFungible(TYPE_NF_0, [await rando.getAddress()]),
      ).to.revertedWith('not an approved creator of id');
    });
  });
});
