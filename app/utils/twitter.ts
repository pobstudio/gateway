import qs from 'query-string';

export const DEFAULT_AT_USERNAME = 'prrfbeauty';
export const DEFAULT_HASHTAGS: string[] = [
  'POB',
  'cryptoart',
  'ERC1155',
  'generative',
  'historian',
];

export const getTwitterShareLink = (url: string, text?: string) => {
  const params = {
    url,
    text,
    hashtags: DEFAULT_HASHTAGS,
    via: DEFAULT_AT_USERNAME,
  };
  return `https://twitter.com/intent/tweet?${qs.stringify(params, {
    arrayFormat: 'comma',
  })}`;
};
