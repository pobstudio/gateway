import { AlchemyProvider } from '@ethersproject/providers';
import { deployments } from '@pob/protocol';
import { BigNumber, ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'path';
import {
  CHAIN_ID,
  DRAW_ALCHEMY_KEY,
  MAX_LIVE_COLLECTION_SIZE,
} from '../../constants';
import { COLLECTION_METADATA_MAP } from '../../stores/collections';
import { ADDRESS_REGEX } from '../../utils/regex';

const provider = new AlchemyProvider(1, DRAW_ALCHEMY_KEY);

const handleCollectionNeeds = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { id, blockNum } = req.query;

  if (typeof id !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'id is not a valid value' });
    return;
  }

  if (!COLLECTION_METADATA_MAP[id]) {
    res
      .status(404)
      .json({ statusCode: 404, message: 'id is not a valid value' });
    return;
  }

  if (typeof blockNum !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'blockNum is not a valid value' });
    return;
  }

  if (parseInt(blockNum) === NaN || parseInt(blockNum) < 0) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'blockNum is not a valid value' });
  }

  if (id === 'gas-station') {
    const { numTx } = req.query;

    if (typeof numTx !== 'string') {
      res
        .status(422)
        .json({ statusCode: 422, message: 'numTx is not a valid value' });
      return;
    }

    const { transactions } = await provider.getBlock(parseInt(blockNum));
    if (!transactions) {
      // TODO should this just throw an error?
      res.status(200).json({
        statusCode: 200,
        hashOrIds: [],
      });
    }
    const txs = transactions.slice(0, parseInt(numTx));
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
    );
    res.status(200).json({
      statusCode: 200,
      hashOrIds: txs,
    });
  } else if (id === 'account') {
    const { owner } = req.query;
    if (typeof owner !== 'string') {
      res
        .status(422)
        .json({ statusCode: 422, message: 'owner is not a valid value' });
      return;
    }
    if (!ADDRESS_REGEX.test(owner as string)) {
      res
        .status(422)
        .json({ statusCode: 422, message: 'owner is not a valid value' });
      return;
    }
    let hashOrIds: string[] = [];
    let shouldTryNextPage = true;
    let page = 0;
    while (shouldTryNextPage) {
      const openseaRes = await fetch(
        `https://${
          CHAIN_ID === 1 ? '' : 'rinkeby-'
        }api.opensea.io/api/v1/assets?owner=${owner}&limit=50&offset=${page}&asset_contract_address=${
          deployments[CHAIN_ID].erc1155
        }`,
      );
      if (openseaRes.ok) {
        const { assets } = await openseaRes.json();
        hashOrIds = [
          ...hashOrIds,
          ...assets.map((a: any) => BigNumber.from(a.token_id).toHexString()),
        ];
        if (assets.length < 50) {
          shouldTryNextPage = false;
        } else {
          page += 50;
        }
      } else {
        shouldTryNextPage = false;
        res.status(500).json({
          statusCode: 500,
          message: 'internal error fetching account balance',
        });
        return;
      }
    }
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
    );
    res.status(200).json({
      statusCode: 200,
      hashOrIds,
    });
    return;
  } else {
    res.status(501).json({
      statusCode: 501,
      message: 'collection id is not supported by API at this point',
    });
    return;
  }
};

export default handleCollectionNeeds;
