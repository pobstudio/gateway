import { generateGeneFromTxHash, prerender, DIMENSIONS } from '@pob/sketches';

export const fetchPrerenderLocally = async (provider: any, hash: string) => {
  if (!provider) {
    return null;
  }
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
  return payload;
};

export const fetchGeneLocally = async (provider: any, hash: string) => {
  if (!provider) {
    return null;
  }
  const gene = await generateGeneFromTxHash(provider, hash);
  const payload = {
    statusCode: 200,
    gene,
  };
  return payload;
};
