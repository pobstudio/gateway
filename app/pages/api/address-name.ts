import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { ETHERSCAN_API_KEY } from '../../constants';
import { ADDRESS_REGEX } from '../../utils/regex';

const handleAddressName = async (req: NextApiRequest, res: NextApiResponse) => {
  const { address } = req.query;

  // type and format checks
  if (typeof address !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'address is not a valid value' });
    return;
  }
  if (!ADDRESS_REGEX.test(address as string)) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'address is not a valid value' });
    return;
  }

  const etherscanRes = await fetch(
    `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${ETHERSCAN_API_KEY}`,
  );

  if (etherscanRes.ok) {
    const { result } = await etherscanRes.json();
    res.setHeader(
      'Cache-Control',
      `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`,
    );
    res.status(200).json({
      statusCode: 200,
      address,
      name: result[0].ContractName,
    });
  } else {
    res.status(500).json({
      statusCode: 500,
      message: 'internal server error.',
    });
  }
};

export default handleAddressName;
