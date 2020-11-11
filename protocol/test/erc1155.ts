import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';

import { ERC1155Mintable } from '../typechain/ERC1155Mintable';
import { DummyERC1155Receiver } from '../typechain/DummyERC1155Receiver';
import { WhitelistExchangesProxy } from '../typechain/WhitelistExchangesProxy';
import { expect } from 'chai';

const TYPE_F_0 =
  '0x0000000000000000000000000000000100000000000000000000000000000000';
const TYPE_NF_0 =
  '0x8000000000000000000000000000000200000000000000000000000000000000';

// TODO(dave4506): finish the token tests
describe('ERC1155Token', function () {
  // constant values used in transfer tests
  const nftOwnerBalance = BigNumber.from(1);
  const nftNotOwnerBalance = BigNumber.from(0);
  const spenderInitialFungibleBalance = BigNumber.from(500);
  const receiverInitialFungibleBalance = BigNumber.from(0);
  const fungibleValueToTransfer = spenderInitialFungibleBalance.div(2);
  const nonFungibleValueToTransfer = nftOwnerBalance;
  const receiverCallbackData = '0x01020304';

  let erc1155Mintable: ERC1155Mintable;
  let dummyErc1155Receiver: DummyERC1155Receiver;
  let whitelistExchangesProxy: WhitelistExchangesProxy;

  let owner: Signer;
  let spender: Signer;
  let delegatedSpender: Signer;

  before(async function () {
    const accounts = await ethers.getSigners();
    owner = accounts[0];
    spender = accounts[1];
    delegatedSpender = accounts[2];
  });

  beforeEach(async function () {
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
    const WhitelistExchangesProxy = await ethers.getContractFactory(
      'WhitelistExchangesProxy',
    );
    whitelistExchangesProxy = (await WhitelistExchangesProxy.deploy()) as WhitelistExchangesProxy;
    await whitelistExchangesProxy.deployed();
    //mint tokens
    await erc1155Mintable.connect(owner).create(false);
    await erc1155Mintable
      .connect(owner)
      .mintFungible(
        TYPE_F_0,
        [await spender.getAddress()],
        [spenderInitialFungibleBalance],
      );
    await erc1155Mintable.connect(owner).create(true);
    await erc1155Mintable
      .connect(owner)
      .mintNonFungible(TYPE_NF_0, [await spender.getAddress()]);
  });

  describe('safeTransferFrom', () => {
    const NF_ID_1 = BigNumber.from(TYPE_NF_0).or(1);

    it('should transfer fungible token if called by token owner', async function () {
      // before
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(receiverInitialFungibleBalance);
      // transfer
      await erc1155Mintable
        .connect(spender)
        .safeTransferFrom(
          await spender.getAddress(),
          dummyErc1155Receiver.address,
          TYPE_F_0,
          fungibleValueToTransfer,
          receiverCallbackData,
        );
      // after
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance.sub(fungibleValueToTransfer));
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(fungibleValueToTransfer);
    });
    it('should transfer non-fungible token if called by token owner', async function () {
      // before
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), NF_ID_1),
      ).to.eq(nftOwnerBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, NF_ID_1),
      ).to.eq(nftNotOwnerBalance);
      // transfer
      await erc1155Mintable
        .connect(spender)
        .safeTransferFrom(
          await spender.getAddress(),
          dummyErc1155Receiver.address,
          NF_ID_1,
          nftOwnerBalance,
          receiverCallbackData,
        );
      // after
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), NF_ID_1),
      ).to.eq(nftNotOwnerBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, NF_ID_1),
      ).to.eq(nftOwnerBalance);
    });
    it('should trigger callback if transferring to a contract', async function () {
      // before
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), NF_ID_1),
      ).to.eq(nftOwnerBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, NF_ID_1),
      ).to.eq(nftNotOwnerBalance);
      // transfer
      const tx = await erc1155Mintable
        .connect(spender)
        .safeTransferFrom(
          await spender.getAddress(),
          dummyErc1155Receiver.address,
          NF_ID_1,
          nftOwnerBalance,
          receiverCallbackData,
        );
      // after
      const receipt = await tx.wait();

      const receiverLog = receipt.logs[1];
      // check callback logs
      const expectedCallbackLog = {
        operator: await spender.getAddress(),
        from: await spender.getAddress(),
        tokenId: NF_ID_1,
        tokenValue: nftOwnerBalance,
        data: receiverCallbackData,
      };
      const decodedData = ethers.utils.defaultAbiCoder.decode(
        ['address', 'address', 'uint256', 'uint256', 'bytes'],
        receiverLog.data,
      );
      expect(decodedData[0]).to.be.equal(expectedCallbackLog.operator);
      expect(decodedData[1]).to.be.equal(expectedCallbackLog.from);
      expect(decodedData[2]).to.deep.eq(expectedCallbackLog.tokenId);
      expect(decodedData[3]).to.deep.eq(expectedCallbackLog.tokenValue);
      expect(decodedData[4]).to.deep.equal(expectedCallbackLog.data);

      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), NF_ID_1),
      ).to.eq(nftNotOwnerBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, NF_ID_1),
      ).to.eq(nftOwnerBalance);
    });
    it('should revert if transfer reverts', async () => {
      const valueToTransfer = spenderInitialFungibleBalance.add(1);
      // execute transfer
      return expect(
        erc1155Mintable
          .connect(spender)
          .safeTransferFrom(
            await spender.getAddress(),
            dummyErc1155Receiver.address,
            TYPE_F_0,
            valueToTransfer,
            receiverCallbackData,
          ),
      ).to.be.reverted; //TODO: add specific error
    });
    it('should revert if callback reverts', async () => {
      // set receiver to reject balances
      await dummyErc1155Receiver.connect(owner).setRejectTransferFlag(true);
      // execute transfer
      return expect(
        erc1155Mintable
          .connect(spender)
          .safeTransferFrom(
            await spender.getAddress(),
            dummyErc1155Receiver.address,
            TYPE_F_0,
            fungibleValueToTransfer,
            receiverCallbackData,
          ),
      ).to.revertedWith('TRANSFER_REJECTED');
    });
  });
  describe('batchSafeTransferFrom', () => {
    const NF_ID_1 = BigNumber.from(TYPE_NF_0).or(1);
    it('should transfer fungible tokens if called by token owner', async () => {
      // before
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(receiverInitialFungibleBalance);
      // transfer
      await erc1155Mintable
        .connect(spender)
        .safeBatchTransferFrom(
          await spender.getAddress(),
          dummyErc1155Receiver.address,
          [TYPE_F_0],
          [fungibleValueToTransfer],
          receiverCallbackData,
        );
      // after
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance.sub(fungibleValueToTransfer));
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(fungibleValueToTransfer);
    });
    it('should transfer non-fungible token if called by token owner', async () => {
      // before
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), NF_ID_1),
      ).to.eq(nftOwnerBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, NF_ID_1),
      ).to.eq(nftNotOwnerBalance);
      // transfer
      await erc1155Mintable
        .connect(spender)
        .safeBatchTransferFrom(
          await spender.getAddress(),
          dummyErc1155Receiver.address,
          [NF_ID_1],
          [nftOwnerBalance],
          receiverCallbackData,
        );
      // after
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), NF_ID_1),
      ).to.eq(nftNotOwnerBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, NF_ID_1),
      ).to.eq(nftOwnerBalance);
    });
    it('should transfer mix of fungible / non-fungible tokens if called by token owner', async () => {
      // before
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(receiverInitialFungibleBalance);
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), NF_ID_1),
      ).to.eq(nftOwnerBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, NF_ID_1),
      ).to.eq(nftNotOwnerBalance);
      // transfer
      await erc1155Mintable
        .connect(spender)
        .safeBatchTransferFrom(
          await spender.getAddress(),
          dummyErc1155Receiver.address,
          [TYPE_F_0, NF_ID_1],
          [fungibleValueToTransfer, nftOwnerBalance],
          receiverCallbackData,
        );
      // after
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance.sub(fungibleValueToTransfer));
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(fungibleValueToTransfer);
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), NF_ID_1),
      ).to.eq(nftNotOwnerBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, NF_ID_1),
      ).to.eq(nftOwnerBalance);
    });
    it('should trigger callback if transferring to a contract', async () => {
      // before
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(receiverInitialFungibleBalance);
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), NF_ID_1),
      ).to.eq(nftOwnerBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, NF_ID_1),
      ).to.eq(nftNotOwnerBalance);
      // transfer
      const tx = await erc1155Mintable
        .connect(spender)
        .safeBatchTransferFrom(
          await spender.getAddress(),
          dummyErc1155Receiver.address,
          [TYPE_F_0, NF_ID_1],
          [fungibleValueToTransfer, nftOwnerBalance],
          receiverCallbackData,
        );
      // after
      const receipt = await tx.wait();

      const receiverLog = receipt.logs[1];
      // check callback logs
      const expectedCallbackLog = {
        operator: await spender.getAddress(),
        from: await spender.getAddress(),
        tokenIds: [BigNumber.from(TYPE_F_0), NF_ID_1],
        tokenValues: [fungibleValueToTransfer, nftOwnerBalance],
        data: receiverCallbackData,
      };
      const decodedData = ethers.utils.defaultAbiCoder.decode(
        ['address', 'address', 'uint256[]', 'uint256[]', 'bytes'],
        receiverLog.data,
      );
      expect(decodedData[0]).to.be.equal(expectedCallbackLog.operator);
      expect(decodedData[1]).to.be.equal(expectedCallbackLog.from);
      expect(decodedData[2]).to.deep.eq(expectedCallbackLog.tokenIds);
      expect(decodedData[3]).to.deep.eq(expectedCallbackLog.tokenValues);
      expect(decodedData[4]).to.deep.equal(expectedCallbackLog.data);
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance.sub(fungibleValueToTransfer));
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(fungibleValueToTransfer);
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), NF_ID_1),
      ).to.eq(nftNotOwnerBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, NF_ID_1),
      ).to.eq(nftOwnerBalance);
    });
    it('should revert if transfer reverts', async () => {
      const valueToTransfer = spenderInitialFungibleBalance.add(1);
      // execute transfer
      return expect(
        erc1155Mintable
          .connect(spender)
          .safeBatchTransferFrom(
            await spender.getAddress(),
            dummyErc1155Receiver.address,
            [TYPE_F_0],
            [valueToTransfer],
            receiverCallbackData,
          ),
      ).to.be.reverted; //TODO: add specific error
    });
    it('should revert if callback reverts', async () => {
      // set receiver to reject balances
      await dummyErc1155Receiver.connect(owner).setRejectTransferFlag(true);
      // execute transfer
      return expect(
        erc1155Mintable
          .connect(spender)
          .safeBatchTransferFrom(
            await spender.getAddress(),
            dummyErc1155Receiver.address,
            [TYPE_F_0],
            [fungibleValueToTransfer],
            receiverCallbackData,
          ),
      ).to.revertedWith('TRANSFER_REJECTED');
    });
  });
  describe('setApprovalForAll', () => {
    it('should transfer token via safeTransferFrom if called by approved account', async () => {
      // set approval
      await erc1155Mintable
        .connect(spender)
        .setApprovalForAll(await delegatedSpender.getAddress(), true);

      const isApprovedForAllCheck = await erc1155Mintable.isApprovedForAll(
        await spender.getAddress(),
        await delegatedSpender.getAddress(),
      );
      expect(isApprovedForAllCheck).to.eq(true);

      // before
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(receiverInitialFungibleBalance);
      // transfer
      await erc1155Mintable
        .connect(delegatedSpender)
        .safeTransferFrom(
          await spender.getAddress(),
          dummyErc1155Receiver.address,
          TYPE_F_0,
          fungibleValueToTransfer,
          receiverCallbackData,
        );
      // after
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance.sub(fungibleValueToTransfer));
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(fungibleValueToTransfer);
    });
    it('should transfer token via safeTransferFrom if called by whitelisted account', async () => {
      // set approval
      await whitelistExchangesProxy
        .connect(owner)
        .updateProxyAddress(await delegatedSpender.getAddress(), true);
      await whitelistExchangesProxy.connect(owner).setPaused(false);
      await erc1155Mintable
        .connect(owner)
        .setExchangesRegistry(whitelistExchangesProxy.address);
      const isApprovedForAllCheck = await erc1155Mintable.isApprovedForAll(
        await spender.getAddress(),
        await delegatedSpender.getAddress(),
      );
      expect(isApprovedForAllCheck).to.eq(true);

      // before
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(receiverInitialFungibleBalance);
      // transfer
      await erc1155Mintable
        .connect(delegatedSpender)
        .safeTransferFrom(
          await spender.getAddress(),
          dummyErc1155Receiver.address,
          TYPE_F_0,
          fungibleValueToTransfer,
          receiverCallbackData,
        );
      // after
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance.sub(fungibleValueToTransfer));
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(fungibleValueToTransfer);
    });
    it('should revert if trying to transfer tokens via safeTransferFrom by an unapproved and not whitelisted account', async () => {
      // check approval not set
      await whitelistExchangesProxy.setPaused(false);
      await erc1155Mintable.setExchangesRegistry(
        whitelistExchangesProxy.address,
      );
      const isApprovedForAllCheck = await erc1155Mintable.isApprovedForAll(
        await spender.getAddress(),
        await delegatedSpender.getAddress(),
      );
      expect(isApprovedForAllCheck).to.eq(false);

      // execute transfer
      return expect(
        erc1155Mintable
          .connect(delegatedSpender)
          .safeTransferFrom(
            await spender.getAddress(),
            dummyErc1155Receiver.address,
            TYPE_F_0,
            spenderInitialFungibleBalance,
            receiverCallbackData,
          ),
      ).to.be.reverted; //TODO: add specific error
    });
    it('should revert if trying to transfer tokens via safeTransferFrom by an unapproved account and registry is paused', async () => {
      // check approval not set
      await whitelistExchangesProxy.setPaused(true);
      await erc1155Mintable.setExchangesRegistry(
        whitelistExchangesProxy.address,
      );
      const isApprovedForAllCheck = await erc1155Mintable.isApprovedForAll(
        await spender.getAddress(),
        await delegatedSpender.getAddress(),
      );
      expect(isApprovedForAllCheck).to.eq(false);

      // execute transfer
      return expect(
        erc1155Mintable
          .connect(delegatedSpender)
          .safeTransferFrom(
            await spender.getAddress(),
            dummyErc1155Receiver.address,
            TYPE_F_0,
            spenderInitialFungibleBalance,
            receiverCallbackData,
          ),
      ).to.be.reverted; //TODO: add specific error
    });
    it('should revert if trying to transfer tokens via safeTransferFrom by an unapproved account', async () => {
      const isApprovedForAllCheck = await erc1155Mintable.isApprovedForAll(
        await spender.getAddress(),
        await delegatedSpender.getAddress(),
      );
      expect(isApprovedForAllCheck).to.eq(false);

      // execute transfer
      return expect(
        erc1155Mintable
          .connect(delegatedSpender)
          .safeTransferFrom(
            await spender.getAddress(),
            dummyErc1155Receiver.address,
            TYPE_F_0,
            spenderInitialFungibleBalance,
            receiverCallbackData,
          ),
      ).to.be.reverted; //TODO: add specific error
    });

    it('should transfer token via safeBatchTransferFrom if called by approved account', async () => {
      // set approval
      await erc1155Mintable
        .connect(spender)
        .setApprovalForAll(await delegatedSpender.getAddress(), true);

      const isApprovedForAllCheck = await erc1155Mintable.isApprovedForAll(
        await spender.getAddress(),
        await delegatedSpender.getAddress(),
      );
      expect(isApprovedForAllCheck).to.eq(true);

      // before
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(receiverInitialFungibleBalance);
      // transfer
      await erc1155Mintable
        .connect(delegatedSpender)
        .safeBatchTransferFrom(
          await spender.getAddress(),
          dummyErc1155Receiver.address,
          [TYPE_F_0],
          [fungibleValueToTransfer],
          receiverCallbackData,
        );
      // after
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance.sub(fungibleValueToTransfer));
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(fungibleValueToTransfer);
    });
    it('should transfer token via safeBatchTransferFrom if called by whitelisted account', async () => {
      // set approval
      await whitelistExchangesProxy
        .connect(owner)
        .updateProxyAddress(await delegatedSpender.getAddress(), true);
      await whitelistExchangesProxy.connect(owner).setPaused(false);
      await erc1155Mintable
        .connect(owner)
        .setExchangesRegistry(whitelistExchangesProxy.address);
      const isApprovedForAllCheck = await erc1155Mintable.isApprovedForAll(
        await spender.getAddress(),
        await delegatedSpender.getAddress(),
      );
      expect(isApprovedForAllCheck).to.eq(true);

      // before
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance);
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(receiverInitialFungibleBalance);
      // transfer
      await erc1155Mintable
        .connect(delegatedSpender)
        .safeBatchTransferFrom(
          await spender.getAddress(),
          dummyErc1155Receiver.address,
          [TYPE_F_0],
          [fungibleValueToTransfer],
          receiverCallbackData,
        );
      // after
      expect(
        await erc1155Mintable.balanceOf(await spender.getAddress(), TYPE_F_0),
      ).to.eq(spenderInitialFungibleBalance.sub(fungibleValueToTransfer));
      expect(
        await erc1155Mintable.balanceOf(dummyErc1155Receiver.address, TYPE_F_0),
      ).to.eq(fungibleValueToTransfer);
    });
    it('should revert if trying to transfer tokens via safeBatchTransferFrom by an unapproved and not whitelisted account', async () => {
      // check approval not set
      await whitelistExchangesProxy.setPaused(false);
      await erc1155Mintable.setExchangesRegistry(
        whitelistExchangesProxy.address,
      );
      const isApprovedForAllCheck = await erc1155Mintable.isApprovedForAll(
        await spender.getAddress(),
        await delegatedSpender.getAddress(),
      );
      expect(isApprovedForAllCheck).to.eq(false);

      // execute transfer
      return expect(
        erc1155Mintable
          .connect(delegatedSpender)
          .safeBatchTransferFrom(
            await spender.getAddress(),
            dummyErc1155Receiver.address,
            [TYPE_F_0],
            [spenderInitialFungibleBalance],
            receiverCallbackData,
          ),
      ).to.be.reverted; //TODO: add specific error
    });
    it('should revert if trying to transfer tokens via safeBatchTransferFrom by an unapproved account and registry is paused', async () => {
      // check approval not set
      await whitelistExchangesProxy.setPaused(true);
      await erc1155Mintable.setExchangesRegistry(
        whitelistExchangesProxy.address,
      );
      const isApprovedForAllCheck = await erc1155Mintable.isApprovedForAll(
        await spender.getAddress(),
        await delegatedSpender.getAddress(),
      );
      expect(isApprovedForAllCheck).to.eq(false);

      // execute transfer
      return expect(
        erc1155Mintable
          .connect(delegatedSpender)
          .safeBatchTransferFrom(
            await spender.getAddress(),
            dummyErc1155Receiver.address,
            [TYPE_F_0],
            [spenderInitialFungibleBalance],
            receiverCallbackData,
          ),
      ).to.be.reverted; //TODO: add specific error
    });
    it('should revert if trying to transfer tokens via safeBatchTransferFrom by an unapproved account', async () => {
      const isApprovedForAllCheck = await erc1155Mintable.isApprovedForAll(
        await spender.getAddress(),
        await delegatedSpender.getAddress(),
      );
      expect(isApprovedForAllCheck).to.eq(false);

      // execute transfer
      return expect(
        erc1155Mintable
          .connect(delegatedSpender)
          .safeBatchTransferFrom(
            await spender.getAddress(),
            dummyErc1155Receiver.address,
            [TYPE_F_0],
            [spenderInitialFungibleBalance],
            receiverCallbackData,
          ),
      ).to.be.reverted; //TODO: add specific error
    });
  });
});
