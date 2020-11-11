import * as canvasSketch from 'canvas-sketch';
import {sketch} from './sketch';

const PPI = 300;

(async () => {
  const sketchSettings = {
    prefix: '',
    name: '',
    dimensions: [PPI * 12, PPI * 12],
    animate: false,
    context: 'webgl',
    attributes: {
      antialias: true,
    },
  };
  canvasSketch(await sketch(), sketchSettings);
})();
