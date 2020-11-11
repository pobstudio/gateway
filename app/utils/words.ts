export const maybePluralizeWord = (word: string, items: number) => {
  return `${word}${items !== 1 ? 's' : ''}`;
};
