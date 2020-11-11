import {Color} from '../types';

export const convertHexToColor = (hexStr: string): Color => {
  var bigint = parseInt(hexStr.slice(1), 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;

  return [r / 255, g / 255, b / 255, 1];
};
