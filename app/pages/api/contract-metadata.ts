import { NextApiRequest, NextApiResponse } from 'next';
import { POB_PROD_LINK } from '../../constants';

const handleContractURI = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader(
    'Cache-Control',
    `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
  );
  res.status(200).json({
    name: 'Proof of Beauty',
    description: 'Cryptoart tokens + experimentations.',
    image: `${POB_PROD_LINK}/logo.png`,
    external_link: POB_PROD_LINK,
  });
};

export default handleContractURI;
