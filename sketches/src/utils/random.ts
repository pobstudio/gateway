export type RandomType = 'float' | 'int';

export function randomRangeFactory(randFunc: any) {
  const getFinalizer = (type: RandomType = 'float') => {
    return type === 'float' ? (i: any) => i : Math.floor;
  };

  const utils = {
    randomByWeights: (weights: number[]) => {
      var totalWeight = 0,
        i,
        random;

      for (i = 0; i < weights.length; i++) {
        totalWeight += weights[i];
      }

      random = randFunc() * totalWeight;

      for (i = 0; i < weights.length; i++) {
        if (random < weights[i]) {
          return i;
        }

        random -= weights[i];
      }

      return -1;
    },
    random: (min: number, max: number, type?: RandomType) => {
      return getFinalizer(type)(randFunc() * (max - min) + min);
    },
    randomInArray: (arr: any[]): any => {
      return arr[utils.random(0, arr.length, 'int')];
    },
  };
  return utils;
}
