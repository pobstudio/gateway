import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'lib/src/index.js',
  output: {
    dir: 'lib/dist/',
    format: 'cjs',
  },
  plugins: [json(), commonjs(), terser()],
};
