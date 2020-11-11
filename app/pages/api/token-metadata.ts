import { AlchemyProvider } from '@ethersproject/providers';
import {
  deployments,
  POBMinterFactory,
  POBMinterV2Factory,
} from '@pob/protocol';
import {
  generateGeneFromTxHash,
  generateTokenAttributesFromGene,
} from '@pob/sketches';
import { BigNumber } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  CHAIN_ID,
  POB_PROD_LINK,
  ZERO,
} from '../../constants';
import { ROUTES } from '../../constants/routes';
import { shortenHexString, padHexString } from '../../utils/hex';
import { getEditionFromTokenId } from '../../utils/token';

const provider = new AlchemyProvider(CHAIN_ID, 'PASTE_KEY_HERE');
const drawProvider = provider;

const minter = POBMinterV2Factory.connect(
  deployments[CHAIN_ID].pobMinterV2,
  provider,
);

const minterV1 = POBMinterFactory.connect(
  deployments[CHAIN_ID].pobMinter,
  provider,
);

const handleTokenURI = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (typeof id !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'id is not a valid value' });
    return;
  }
  // checks if token exists
  const hash = await minter.tokenIdToTxHash(BigNumber.from(id)).then((h) => {
    if (h.eq(ZERO)) {
      return minterV1.tokenIdToTxHash(BigNumber.from(id));
    }
    return h;
  });

  if (hash.eq(ZERO)) {
    res
      .status(404)
      .json({ statusCode: 404, message: 'id has not been minted yet.' });
  }

  const paddedHashStr = padHexString(hash.toHexString());

  const gene = await generateGeneFromTxHash(drawProvider, paddedHashStr);

  const attributes = await generateTokenAttributesFromGene(gene);

  const edNum = getEditionFromTokenId(BigNumber.from(id).toHexString());
  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
  );
  res.status(200).json({
    name: `NO. ${edNum} (${shortenHexString(paddedHashStr)})`,
    description: 'Painted by POB.',
    image: paddedHashStr,
    external_link: `${POB_PROD_LINK}${ROUTES.HASH.ART}/${paddedHashStr}`,
    properties: {
      ...attributes,
      tokenSymbol: {
        name: 'Token Symbol',
        value: '$HASH',
      },
    },
    background_color: '232323',
  });
};

export default handleTokenURI;
