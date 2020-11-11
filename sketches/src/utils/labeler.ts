export const labelValueWithRanges = (
  rangeStops: number[],
  labels: string[],
  value: number,
) => {
  let index = 0;
  for (let i = 0; i < rangeStops.length; ++i) {
    if (value >= rangeStops[i]) {
      index = i;
    }
  }
  return labels[index];
};
