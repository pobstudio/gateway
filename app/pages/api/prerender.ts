import { NextApiRequest, NextApiResponse } from 'next';
import { DIMENSIONS, generateGeneFromTxHash, prerender } from '@pob/sketches';
import { AlchemyProvider } from '@ethersproject/providers';
import { DRAW_ALCHEMY_KEY } from '../../constants';
import { TX_HASH_REGEX } from '../../utils/regex';

const provider = new AlchemyProvider(1, DRAW_ALCHEMY_KEY);

const handlePrerender = async (req: NextApiRequest, res: NextApiResponse) => {
  const { hash } = req.query;

  // type and format checks
  if (typeof hash !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'txHash is not a valid value' });
    return;
  }
  if (!TX_HASH_REGEX.test(hash as string)) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'txHash is not a valid value' });
    return;
  }

  try {
    const gene = await generateGeneFromTxHash(provider, hash);

    const payload = {
      statusCode: 200,
      gene,
      data: prerender(
        {
          width: DIMENSIONS[0],
          height: DIMENSIONS[1],
        },
        gene,
      ),
    };
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=3600, max-age=3600`,
    );
    res.status(200).json(payload);
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    const errResponse = { statusCode, message: err.message };
    res.status(statusCode).json(errResponse);
  }
};

export default handlePrerender;
