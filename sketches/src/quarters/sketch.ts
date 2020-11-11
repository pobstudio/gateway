import { Bound, Cord, Color } from '../types';
import createRegl, { Regl } from 'regl';
import glslify from 'glslify';

import { convertHexToColor } from '../utils/color';

import flatten from 'lodash/flatten';
import { rectToBounds, rectToCorners } from '../utils/primitives';
import { addVec2, subVec2 } from '../utils/vector';
import { DEFAULT_GENE, EllipseQuartersProps, Gene } from './types';
import { newArray } from '../utils';

const INDEXES = newArray(92).map((_: any, i: number) => i);

export const sketch = (
  sketchContext: any,
  ellipseQuartersProps: EllipseQuartersProps[][],
  gene: Gene,
) => {
  const { gl } = sketchContext;

  const regl = createRegl({ gl });

  const { background, foreground, generateQuarters } = gene;
  
  const sketchBounds: Bound = [sketchContext.width, sketchContext.height];

  const createEllipseQuartersCommand = () => {
    interface CommandProps {
      position: Cord[];
      color: Color;
      tintColors: number[];
      offset: number;
      z: number;
      dimension: Bound[];
      center: Cord;
      anchor: Cord;
      corner: number;
    }

    const command = regl({
      frag: glslify(`
                        precision mediump float;

                        vec3 mod289(vec3 x) {
                          return x - floor(x * (1.0 / 289.0)) * 289.0;
                        }
                        
                        vec2 mod289(vec2 x) {
                          return x - floor(x * (1.0 / 289.0)) * 289.0;
                        }
                        
                        vec3 permute(vec3 x) {
                          return mod289(((x*34.0)+1.0)*x);
                        }
                        
                        float snoise(vec2 v)
                          {
                          const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                              0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                                             -0.577350269189626,  // -1.0 + 2.0 * C.x
                                              0.024390243902439); // 1.0 / 41.0
                        // First corner
                          vec2 i  = floor(v + dot(v, C.yy) );
                          vec2 x0 = v -   i + dot(i, C.xx);
                        
                        // Other corners
                          vec2 i1;
                          //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
                          //i1.y = 1.0 - i1.x;
                          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                          // x0 = x0 - 0.0 + 0.0 * C.xx ;
                          // x1 = x0 - i1 + 1.0 * C.xx ;
                          // x2 = x0 - 1.0 + 2.0 * C.xx ;
                          vec4 x12 = x0.xyxy + C.xxzz;
                          x12.xy -= i1;
                        
                        // Permutations
                          i = mod289(i); // Avoid truncation effects in permutation
                          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                            + i.x + vec3(0.0, i1.x, 1.0 ));
                        
                          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                          m = m*m ;
                          m = m*m ;
                        
                        // Gradients: 41 points uniformly over a line, mapped onto a diamond.
                        // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
                        
                          vec3 x = 2.0 * fract(p * C.www) - 1.0;
                          vec3 h = abs(x) - 0.5;
                          vec3 ox = floor(x + 0.5);
                          vec3 a0 = x - ox;
                        
                        // Normalise gradients implicitly by scaling m
                        // Approximation of: m *= inversesqrt( a0*a0 + h*h );
                          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                        
                        // Compute final noise value at P
                          vec3 g;
                          g.x  = a0.x  * x0.x  + h.x  * x0.y;
                          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                          return 130.0 * dot(m, g);
                        }

                        highp float random(vec2 co)
                        {
                            highp float a = 12.9898;
                            highp float b = 78.233;
                            highp float c = 43758.5453;
                            highp float dt= dot(co.xy ,vec2(a,b));
                            highp float sn= mod(dt,3.14);
                            return fract(sin(sn) * c);
                        }

                        // uniforms
                        uniform float pointilism;
                        uniform vec4 color;
                        uniform mat4 tintColors;
                        uniform float gapSize;
                        uniform float offset;
                        uniform vec2 dotBounds;
                        uniform vec2 resolution;

                        mat2 getRotateMatByIndex (int index) {
                          if (index == 0) {
                            return mat2(0.707, -0.707, 0.707, 0.707);
                          }
                          if (index == 1) {
                            return mat2(0.966, -0.259, 0.259, 0.966);
                          }
                          if (index == 2) {
                            return mat2(0.966, 0.259, -0.259, 0.966);
                          }
                          return mat2(1.0);
                        }

                        float getDistance (int index) {
                          vec2 cord = getRotateMatByIndex(index) * gl_FragCoord.xy;
                          vec2 nearest = floor(cord / gapSize) * gapSize;
                          float dist = length(cord - nearest);
                          return dist; 
                        }

                        vec4 getTintColor (int index) {
                          if (index == 0) {
                            return tintColors[0]; 
                          }
                          if (index == 1) {
                            return tintColors[1]; 
                          }
                          if (index == 2) {
                            return tintColors[2]; 
                          }
                          if (index == 3) {
                            return tintColors[3]; 
                          }
                          return color;
                        }

                        float getRadius (int index) {
                          float random_offset = abs(random(vec2(float(index) + offset)));
                          float smooth_coeff = abs(snoise(gl_FragCoord.xy * pointilism * random_offset));
                          float coeff = smooth_coeff;
                          return mix(dotBounds[0], dotBounds[1], coeff);
                        }

                        void main () {
                          int closestIndex = 0;
                          float closestDistance = max(resolution[0], resolution[1]);
                          for (int i = 0; i < 4; i++) {
                            float d = getDistance(i);
                            if (d < closestDistance) {
                              closestIndex = i;
                              closestDistance = d;
                            }
                          }

                          vec4 tintedColor = getTintColor(closestIndex);

                          float radius = getRadius(closestIndex);

                          gl_FragColor = mix(tintedColor, color, step(radius, closestDistance));
                        }
                    `),
      vert: glslify(`
                        precision mediump float;

                        // uniforms
                        uniform vec2 resolution;
                        uniform float z;
                        uniform vec2 dimension;
                        uniform vec2 center;
                        uniform vec2 anchor;
                        uniform int corner;
 
                        // attributes
                        attribute float index;

                        // constants
                        const float PI = 3.1415926535897932384626433832795;

                        void main () {
                          vec2 position;
                          float radius = min(dimension[0], dimension[1]);
                          if (index == 0.0) {
                            position = center;
                          } else {
                            float r = (PI / 180.0) * (index - 1.0);
                            vec2 d;
                            if (corner == 0) {
                              d = radius * vec2(cos(r), sin(r));
                            }
                            if (corner == 1) {
                              d = vec2(dimension[0] - radius * cos(r), radius * sin(r));
                            }
                            if (corner == 2) {
                              d = vec2(radius * cos(r), dimension[1] - radius * sin(r));
                            }
                            if (corner == 3) {
                              d = vec2(dimension[0] - radius * cos(r), dimension[1] - radius * sin(r));
                            }
                            position = d + anchor;
                          }
                          vec2 normalizedCords = vec2(2, 2) * (position / resolution);
                          normalizedCords *= vec2(1, -1);
                          normalizedCords += vec2(-1, 1);
                          gl_Position = vec4(normalizedCords, z, 1);
                        }
                    `),
      primitive: 'triangle fan',
      attributes: {
        index: INDEXES,
      },
      uniforms: {
        offset: regl.prop<CommandProps, 'offset'>('offset'),
        pointilism: foreground.pointilism,
        gapSize: foreground.gapSize,
        dotBounds: foreground.dotBounds,
        resolution: sketchBounds,
        z: regl.prop<CommandProps, 'z'>('z'),
        color: regl.prop<CommandProps, 'color'>('color'),
        tintColors: regl.prop<CommandProps, 'tintColors'>('tintColors'),
        dimension: regl.prop<CommandProps, 'dimension'>('dimension'),
        center: regl.prop<CommandProps, 'center'>('center'),
        anchor: regl.prop<CommandProps, 'anchor'>('anchor'),
        corner: regl.prop<CommandProps, 'corner'>('corner'),
      },
      depth: {
        enable: true,
        mask: false,
        func: 'lequal',
        range: [0, 1],
      },
      count: INDEXES.length,
    });

    return (props: EllipseQuartersProps[]) => {
      command(
        props.map((p: EllipseQuartersProps, i: number) => {
          return {
            offset: i,
            color: convertHexToColor(p.colorPallete.color),
            tintColors: flatten(
              p.colorPallete.tintColors.map(convertHexToColor),
            ),
            z: (p.layer + 1) / generateQuarters.layers.length,
            dimension: rectToBounds(p.rect),
            center: rectToCorners(p.rect)[p.corner],
            anchor: p.rect[0],
            corner: p.corner,
          };
        }),
      );
    };
  };

  return {
    render: () => {
      const drawEllipseQuarters = createEllipseQuartersCommand();

      // Update regl sizes
      regl.poll();

      regl.clear({
        color: convertHexToColor(background.color),
      });

      ellipseQuartersProps.forEach((quarters, i) => {
        drawEllipseQuarters(quarters);
      });
    },
    end: () => {
      regl.destroy();
    },
  };
};

// graveyard
/**
import { Bound, Cord, Color } from '../types';
import createRegl, { Regl } from 'regl';
import glslify from 'glslify';

import { convertHexToColor } from '../utils/color';

import { flatten } from 'lodash';
import { rectToBounds, rectToCorners } from '../utils/primitives';
import { addVec2, subVec2 } from '../utils/vector';
import { DEFAULT_GENE, EllipseQuartersProps, Gene } from './types';

export const sketch = (
  sketchContext: any,
  ellipseQuartersProps: EllipseQuartersProps[][],
  gene: Gene,
) => {
  const { gl } = sketchContext;

  const regl = createRegl({ gl,
    extensions: ['oes_texture_float']
  });

  const { background, foreground, generateQuarters } = gene;

  const sketchBounds: Bound = [sketchContext.width, sketchContext.height];

  const createEllipseQuartersCommand = () => {
    interface CommandProps {
      position: Cord[];
      color: Color;
      tintColors: number[];
      offset: number;
      z: number;
    }

    const command = regl({
      frag: glslify(`
                        precision mediump float;

                        vec3 mod289(vec3 x) {
                          return x - floor(x * (1.0 / 289.0)) * 289.0;
                        }
                        
                        vec2 mod289(vec2 x) {
                          return x - floor(x * (1.0 / 289.0)) * 289.0;
                        }
                        
                        vec3 permute(vec3 x) {
                          return mod289(((x*34.0)+1.0)*x);
                        }
                        
                        float snoise(vec2 v)
                          {
                          const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                              0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                                             -0.577350269189626,  // -1.0 + 2.0 * C.x
                                              0.024390243902439); // 1.0 / 41.0
                        // First corner
                          vec2 i  = floor(v + dot(v, C.yy) );
                          vec2 x0 = v -   i + dot(i, C.xx);
                        
                        // Other corners
                          vec2 i1;
                          //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
                          //i1.y = 1.0 - i1.x;
                          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                          // x0 = x0 - 0.0 + 0.0 * C.xx ;
                          // x1 = x0 - i1 + 1.0 * C.xx ;
                          // x2 = x0 - 1.0 + 2.0 * C.xx ;
                          vec4 x12 = x0.xyxy + C.xxzz;
                          x12.xy -= i1;
                        
                        // Permutations
                          i = mod289(i); // Avoid truncation effects in permutation
                          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                            + i.x + vec3(0.0, i1.x, 1.0 ));
                        
                          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                          m = m*m ;
                          m = m*m ;
                        
                        // Gradients: 41 points uniformly over a line, mapped onto a diamond.
                        // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
                        
                          vec3 x = 2.0 * fract(p * C.www) - 1.0;
                          vec3 h = abs(x) - 0.5;
                          vec3 ox = floor(x + 0.5);
                          vec3 a0 = x - ox;
                        
                        // Normalise gradients implicitly by scaling m
                        // Approximation of: m *= inversesqrt( a0*a0 + h*h );
                          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                        
                        // Compute final noise value at P
                          vec3 g;
                          g.x  = a0.x  * x0.x  + h.x  * x0.y;
                          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                          return 130.0 * dot(m, g);
                        }

                        highp float random(vec2 co)
                        {
                            highp float a = 12.9898;
                            highp float b = 78.233;
                            highp float c = 43758.5453;
                            highp float dt= dot(co.xy ,vec2(a,b));
                            highp float sn= mod(dt,3.14);
                            return fract(sin(sn) * c);
                        }

                        // uniforms
                        uniform float pointilism;
                        uniform vec4 color;
                        uniform mat4 tintColors;
                        uniform float gapSize;
                        uniform float offset;
                        uniform vec2 dotBounds;
                        uniform vec2 resolution;

                        mat2 getRotateMatByIndex (int index) {
                          if (index == 0) {
                            return mat2(0.707, -0.707, 0.707, 0.707);
                          }
                          if (index == 1) {
                            return mat2(0.966, -0.259, 0.259, 0.966);
                          }
                          if (index == 2) {
                            return mat2(0.966, 0.259, -0.259, 0.966);
                          }
                          return mat2(1.0);
                        }

                        float getDistance (int index) {
                          vec2 cord = getRotateMatByIndex(index) * gl_FragCoord.xy;
                          vec2 nearest = floor(cord / gapSize) * gapSize;
                          float dist = length(cord - nearest);
                          return dist; 
                        }

                        vec4 getTintColor (int index) {
                          if (index == 0) {
                            return tintColors[0]; 
                          }
                          if (index == 1) {
                            return tintColors[1]; 
                          }
                          if (index == 2) {
                            return tintColors[2]; 
                          }
                          if (index == 3) {
                            return tintColors[3]; 
                          }
                          return color;
                        }

                        float getRadius (int index) {
                          float random_offset = abs(random(vec2(float(index) + offset)));
                          float smooth_coeff = abs(snoise(gl_FragCoord.xy * pointilism * random_offset));
                          float coeff = smooth_coeff;
                          return mix(dotBounds[0], dotBounds[1], coeff);
                        }

                        void main () {
                          int closestIndex = 0;
                          float closestDistance = max(resolution[0], resolution[1]);
                          for (int i = 0; i < 4; i++) {
                            float d = getDistance(i);
                            if (d < closestDistance) {
                              closestIndex = i;
                              closestDistance = d;
                            }
                          }

                          vec4 tintedColor = getTintColor(closestIndex);

                          float radius = getRadius(closestIndex);

                          gl_FragColor = mix(tintedColor, color, step(radius, closestDistance));
                        }
                    `),
      vert: glslify(`
                        precision mediump float;

                        // uniforms
                        uniform vec2 resolution;
                        uniform float z;

                        // attributes
                        attribute vec2 position;

                        void main () {
                          vec2 normalizedCords = vec2(2, 2) * (position / resolution);
                          normalizedCords *= vec2(1, -1);
                          normalizedCords += vec2(-1, 1);
                          gl_Position = vec4(normalizedCords, z, 1);
                        }
                    `),
      primitive: 'triangle fan',
      attributes: {
        position: regl.prop<CommandProps, 'position'>('position'),
      },
      uniforms: {
        offset: regl.prop<CommandProps, 'offset'>('offset'),
        pointilism: foreground.pointilism,
        gapSize: foreground.gapSize,
        dotBounds: foreground.dotBounds,
        resolution: sketchBounds,
        z: regl.prop<CommandProps, 'z'>('z'),
        color: regl.prop<CommandProps, 'color'>('color'),
        tintColors: regl.prop<CommandProps, 'tintColors'>('tintColors'),
      },
      depth: {
        enable: true,
        mask: false,
        func: 'lequal',
        range: [0, 1],
      },
      count: (_, props: CommandProps) => props.position.length,
    });

    return (props: EllipseQuartersProps[]) => {
      const triangles = props.map((p) => {
        const dimensions: Bound = rectToBounds(p.rect);
        const center: Cord = rectToCorners(p.rect)[p.corner];
        const radius = Math.max(...dimensions);
        const position = [center];
        for (let r = 0; r <= Math.PI / 2 + Math.PI / 180; r += Math.PI / 180) {
          if (p.corner === 0) {
            position.push(
              addVec2([radius * Math.cos(r), radius * Math.sin(r)], p.rect[0]),
            );
          }
          if (p.corner === 1) {
            position.push(
              addVec2(
                [dimensions[0] - radius * Math.cos(r), radius * Math.sin(r)],
                p.rect[0],
              ),
            );
          }
          if (p.corner === 2) {
            position.push(
              addVec2(
                [radius * Math.cos(r), dimensions[1] - radius * Math.sin(r)],
                p.rect[0],
              ),
            );
          }
          if (p.corner === 3) {
            position.push(
              addVec2(
                [
                  dimensions[0] - radius * Math.cos(r),
                  dimensions[1] - radius * Math.sin(r),
                ],
                p.rect[0],
              ),
            );
          }
        }
        return position;
      });

      command(
        triangles.map((p: Cord[], i: number) => {
          const prop = props[i];
          return {
            offset: i,
            position: p,
            color: convertHexToColor(prop.colorPallete.color),
            tintColors: flatten(
              prop.colorPallete.tintColors.map(convertHexToColor),
            ),
            z: (prop.layer + 1) / generateQuarters.layers.length,
          };
        }),
      );
    };
  };

  const drawEllipseQuarterLayers = (props: EllipseQuartersProps[]) => {
    interface CommandProps {
      color: Color;
      tintColors: number[];
      offset: number;
      z: number;
      quarters: createRegl.Texture2D;
    }

    // x,y,r,ci
    // const quartersRawTexture: number[][][] = [props.map(p => {
    //   return [...p.rect[0], Math.min(...subVec2(p.rect[1], p.rect[0])), p.corner];
    // })];

    const quartersRawTexture = [
      [ [100],  [255] ],
      [ [50], [150] ]
    ];
    console.log(quartersRawTexture);

    const quarters = regl.texture({
      width: 2,
      height: 2,
      data: [
        200, 255, 255, 255, 0, 0, 0, 0,
        255, 0, 255, 255, 0, 0, 255, 255
      ]
    })

    const command = regl({
      frag: glslify(`
                        precision mediump float;

                        vec3 mod289(vec3 x) {
                          return x - floor(x * (1.0 / 289.0)) * 289.0;
                        }
                        
                        vec2 mod289(vec2 x) {
                          return x - floor(x * (1.0 / 289.0)) * 289.0;
                        }
                        
                        vec3 permute(vec3 x) {
                          return mod289(((x*34.0)+1.0)*x);
                        }
                        
                        float snoise(vec2 v)
                          {
                          const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                              0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                                             -0.577350269189626,  // -1.0 + 2.0 * C.x
                                              0.024390243902439); // 1.0 / 41.0
                        // First corner
                          vec2 i  = floor(v + dot(v, C.yy) );
                          vec2 x0 = v -   i + dot(i, C.xx);
                        
                        // Other corners
                          vec2 i1;
                          //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
                          //i1.y = 1.0 - i1.x;
                          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                          // x0 = x0 - 0.0 + 0.0 * C.xx ;
                          // x1 = x0 - i1 + 1.0 * C.xx ;
                          // x2 = x0 - 1.0 + 2.0 * C.xx ;
                          vec4 x12 = x0.xyxy + C.xxzz;
                          x12.xy -= i1;
                        
                        // Permutations
                          i = mod289(i); // Avoid truncation effects in permutation
                          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                            + i.x + vec3(0.0, i1.x, 1.0 ));
                        
                          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                          m = m*m ;
                          m = m*m ;
                        
                        // Gradients: 41 points uniformly over a line, mapped onto a diamond.
                        // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
                        
                          vec3 x = 2.0 * fract(p * C.www) - 1.0;
                          vec3 h = abs(x) - 0.5;
                          vec3 ox = floor(x + 0.5);
                          vec3 a0 = x - ox;
                        
                        // Normalise gradients implicitly by scaling m
                        // Approximation of: m *= inversesqrt( a0*a0 + h*h );
                          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                        
                        // Compute final noise value at P
                          vec3 g;
                          g.x  = a0.x  * x0.x  + h.x  * x0.y;
                          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                          return 130.0 * dot(m, g);
                        }

                        highp float random(vec2 co)
                        {
                            highp float a = 12.9898;
                            highp float b = 78.233;
                            highp float c = 43758.5453;
                            highp float dt= dot(co.xy ,vec2(a,b));
                            highp float sn= mod(dt,3.14);
                            return fract(sin(sn) * c);
                        }

                        // uniforms
                        uniform float pointilism;
                        uniform vec4 color;
                        uniform mat4 tintColors;
                        uniform float gapSize;
                        uniform float offset;
                        uniform vec2 dotBounds;
                        uniform vec2 resolution;
                        uniform vec4 backgroundColor;
                        uniform sampler2D quarters;

                        const vec2 quartersDimensions = vec2(${quartersRawTexture.length}, ${quartersRawTexture[0].length});

                        mat2 getRotateMatByIndex (int index) {
                          if (index == 0) {
                            return mat2(0.707, -0.707, 0.707, 0.707);
                          }
                          if (index == 1) {
                            return mat2(0.966, -0.259, 0.259, 0.966);
                          }
                          if (index == 2) {
                            return mat2(0.966, 0.259, -0.259, 0.966);
                          }
                          return mat2(1.0);
                        }

                        float getDistance (int index) {
                          vec2 cord = getRotateMatByIndex(index) * gl_FragCoord.xy;
                          vec2 nearest = floor(cord / gapSize) * gapSize;
                          float dist = length(cord - nearest);
                          return dist; 
                        }

                        vec4 getTintColor (int index) {
                          if (index == 0) {
                            return tintColors[0]; 
                          }
                          if (index == 1) {
                            return tintColors[1]; 
                          }
                          if (index == 2) {
                            return tintColors[2]; 
                          }
                          if (index == 3) {
                            return tintColors[3]; 
                          }
                          return color;
                        }

                        float getRadius (int index) {
                          float random_offset = abs(random(vec2(float(index) + offset)));
                          float smooth_coeff = abs(snoise(gl_FragCoord.xy * pointilism * random_offset));
                          float coeff = smooth_coeff;
                          return mix(dotBounds[0], dotBounds[1], coeff);
                        }

                        bool circle (vec2 p, float r) {
                          return length(p) <= r;
                        }

                        bool square (vec2 p, float s) {
                          return p[0] >= 0.0 && p[0] <= s && p[1] <= 0.0 && p[1] >= -1.0 * s;
                        }

                        bool circleByCornerIndex(vec2 p, float r, int ci) {
                          if (ci == 1) {
                            return circle(p + vec2(-r, 0), r);
                          }
                          if (ci == 2) {
                            return circle(p + vec2(-r, r), r);
                          }
                          if (ci == 3) {
                            return circle(p + vec2(0, r), r);
                          }
                          return circle(p, r);
                        }

                        bool quarter(vec2 p, float r, int ci) {
                          return square(p, r) && circleByCornerIndex(p, r, ci);
                        }

                        vec4 scene () {
                          vec2 coord = (gl_FragCoord.xy - vec2(0.0, resolution[1]));
                          vec4 v = backgroundColor;
                          for (int i = 0; i < ${quartersRawTexture[0].length}; i++) {
                            vec2 uv = (vec2(0.0, i) + .5) / quartersDimensions;
                            float x = texture2D(quarters, vec2(0.25, 0.25)).r;  // just the red channel

                            // vec4 q = texture2D(quarters, vec2(0, 0));

                            if (quarter(coord + vec2(-100, x), 100.0, 0)) {
                              v = vec4(1.0, 0.0, 0.0, 1.0);
                            }
                          }
                          float x = texture2D(quarters, vec2(0.25, 0.25)).r;  // just the red channel
                          return v;
                        }

                        void main () {
                          // int closestIndex = 0;
                          // float closestDistance = max(resolution[0], resolution[1]);
                          // for (int i = 0; i < 4; i++) {
                          //   float d = getDistance(i);
                          //   if (d < closestDistance) {
                          //     closestIndex = i;
                          //     closestDistance = d;
                          //   }
                          // }

                          // vec4 tintedColor = getTintColor(closestIndex);

                          // float radius = getRadius(closestIndex);

                          // gl_FragColor = mix(tintedColor, color, step(radius, closestDistance));
                          gl_FragColor = scene();
                        }
                    `),
      vert: glslify(`
                        precision mediump float;

                        // uniforms
                        uniform vec2 resolution;
                        uniform float z;

                        // attributes
                        attribute vec2 position;

                        void main () {
                          vec2 normalizedCords = vec2(2, 2) * (position / resolution);
                          normalizedCords *= vec2(1, -1);
                          normalizedCords += vec2(-1, 1);
                          gl_Position = vec4(normalizedCords, z, 1);
                        }
                    `),
      primitive: 'triangle strip',

      attributes: {
        position: [
          [0, 0], 
          [0, sketchBounds[1]],
          sketchBounds,
          [sketchBounds[0], 0],
          [0, 0],
        ],
      },
      uniforms: {
        // quarters
        quarters,
        // texture
        offset: regl.prop<CommandProps, 'offset'>('offset'),
        pointilism: foreground.pointilism,
        gapSize: foreground.gapSize,
        dotBounds: foreground.dotBounds,
        // colors
        backgroundColor: convertHexToColor(background.color),
        color: regl.prop<CommandProps, 'color'>('color'),
        tintColors: regl.prop<CommandProps, 'tintColors'>('tintColors'),
        // globals
        resolution: sketchBounds,
        z: regl.prop<CommandProps, 'z'>('z'),
      },
      depth: {
        enable: true,
        mask: false,
        func: 'lequal',
        range: [0, 1],
      },
      count: 5,
    });

      command({
        offset: 0, 
        z: 0,
        color: [1, 0, 0, 1],
        tintColors: [],
      });
  }

  return {
    render: () => {
      const drawEllipseQuarters = createEllipseQuartersCommand();

      // Update regl sizes
      regl.poll();

      regl.clear({
        color: convertHexToColor(background.color),
      });

      console.log(ellipseQuartersProps);
      // ellipseQuartersProps.forEach((quarters, i) => {
      //   drawEllipseQuarters(quarters);
      // });
      drawEllipseQuarterLayers(ellipseQuartersProps[0]);
      // drawEllipseQuarterLayers(
      //   [{
      //     rect: [[100, 100], [200, 200]],
      //     corner: 0,
      //     colorPallete: ellipseQuartersProps[0][0].colorPallete,
      //     layer: 0,
      //   }]
      // );
    },
    end: () => {},
  };
};
 */
