export const getCyclicIndex = (index: number, length: number) => {
  return index % length >= 0 ? index % length : length + (index % length);
};
