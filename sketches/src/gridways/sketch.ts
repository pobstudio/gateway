import {
  Bound,
  Cord,
  Color,
  Line,
  Rect,
  SketchContext,
  RectByTriangle,
  Range,
  Animation,
} from '../types';
import * as createRegl from 'regl';
import * as glslify from 'glslify';
import * as newArray from 'new-array';
import * as seedrandom from 'seedrandom';
import * as SimplexNoise from 'simplex-noise';

import {convertHexToColor} from '../utils/color';
import {randomRangeFactory} from '../utils/random';

import {chunk, filter, find, flatten, flattenDeep, groupBy, pick} from 'lodash';
import {rectToTriangles} from '../utils/primitives';
import {toColorString} from 'polished';

//Gene type all visual elements are in pixels unless specified
interface Gene {
  seed: string;
  animation: {
    endDelayInTicks: number;
    startDelayInTicks: number;
    breathDurationInTicks: number;
    bloomMaxStartDelayInTicks: number;
  };
  parallax: {
    offsetStrength: Cord;
    depthStrength: number;
    rotationStrength: number;
    animationTickCount: number;
  };
  foreground: {
    pointilism: number;
    noiselism: number;
    colorPointilism: number;
    colorPalletes: string[][];
    tintColors: string[];
  };
  background: {
    colors: [string, string];
    tintColor: string;
    pointilism: number;
    noiselism: number;
  };
  gridLinesToRects: {
    gitter: Range; // ratio of the gap from [0,1] that the rect can be slightly offset to
  };
  gridParitioning: {
    vertOrHorzRatio: number;
    gap: number;
    unitSize: Bound;
    gridSizeInUnits: Bound;
  };
}

const DEFAULT_GENE: Gene = {
  seed: '0xdf944cd665a62371102d37cdd3ce31b2da16f3818044285714f982b19bf018f1',
  animation: {
    startDelayInTicks: 0,
    endDelayInTicks: 0,
    breathDurationInTicks: 200,
    bloomMaxStartDelayInTicks: 200,
  },
  parallax: {
    offsetStrength: [0.02, 0.02],
    depthStrength: 0.5,
    rotationStrength: 0.005,
    animationTickCount: 10,
  },
  foreground: {
    pointilism: 0.2,
    noiselism: 900,
    colorPalletes: [
      ['#4e89ae', '#d6e0f0', '#f1f3f8'],
      ['#43658b', '#145374', '#00334e'],
      ['#ed6663', '#ee6f57', '#ec0101'],
      ['#ffa372', '#f8bd7f', '#edcfa9'],
    ],
    tintColors: ['#f6f5f5', '#ee6f57', '#1f3c88', '#070d59'],
    colorPointilism: 0.01,
  },
  background: {
    colors: ['#1a1a2e', '#000000'],
    tintColor: '#495464',
    pointilism: 0.05,
    noiselism: 1000,
  },
  gridLinesToRects: {
    gitter: [0, 0],
  },
  gridParitioning: {
    vertOrHorzRatio: 0.5,
    gap: 15,
    unitSize: [10, 10],
    gridSizeInUnits: [120, 80],
  },
};

export const sketch = async (gene: Gene = DEFAULT_GENE) => {
  const rand = seedrandom(gene.seed);
  const simplex = new SimplexNoise(gene.seed);
  const {randomInArray, random} = randomRangeFactory(rand);
  return (sketchContext: SketchContext) => {
    console.log(sketchContext);
    const {gl} = sketchContext;

    let mouseCords = [0, 0];
    let isMouseInCanvas = false;

    const {
      parallax,
      foreground,
      background,
      gridParitioning,
      gridLinesToRects,
      animation,
    } = gene;

    const regl = createRegl({gl});

    const start = () => {
      regl.poll();
      regl.clear({
        color: convertHexToColor('#ffffff'),
      });
    };

    // broad strokes assumption these are non overlapping
    const drawSimpleRects = (
      rects: Rect[],
      rectProps: any[],
      globalProps: any,
    ) => {
      const triangles = rects.map(rectToTriangles);

      interface CommandProps {
        fromColor: Color;
        toColor: Color;
        tintColor: Color;
        position: Cord[];
        isVert: boolean;
        zIndex: number;
      }

      const command = regl({
        frag: glslify(`
                        precision mediump float;

                        #pragma glslify: noise = require('glsl-noise/simplex/2d');
                        #pragma glslify: cnoise2 = require('glsl-noise/classic/2d'); 

                        uniform vec4 tintColor;
                        uniform vec4 fromColor;
                        uniform vec4 toColor;
                        uniform float pointilism;
                        uniform float noiselism;
                        uniform vec2 resolution;
                        uniform bool isVert;

                        void main () {
                            vec2 cord = gl_FragCoord.xy / resolution;
                            vec4 color = mix(toColor, fromColor, isVert ? cord.y : cord.x);
                            float smooth_coeff = abs(noise(cord.xy * pointilism));
                            float noise_coeff = abs(cnoise2(cord.xy * noiselism));
                            float coeff = smooth_coeff * noise_coeff;
                            gl_FragColor = mix(color, tintColor, coeff);
                        }
                    `),
        vert: glslify(`
                        precision mediump float;

                        #pragma glslify: rotate = require(glsl-rotate)


                        // uniforms
                        uniform vec2 resolution;
                        uniform vec2 offset;
                        uniform float zIndex;
                        uniform float depthStrength;
                        uniform float rotationStrength;

                        // attributes
                        attribute vec2 position;

                        void main () {
                            vec3 xAxis = vec3(0.0, 1.0, 0.0);
                            vec3 yAxis = vec3(1.0, 0.0, 0.0);
                            vec2 normalizedCords = vec2(2, 2) * ((position + (offset * depthStrength * zIndex)) / resolution);
                            normalizedCords *= vec2(1, -1);
                            normalizedCords += vec2(-1, 1);
                            vec3 pos = rotate(rotate(vec3(normalizedCords, 0), xAxis, 1.0 * rotationStrength * offset[0]), yAxis, -1.0 * rotationStrength * offset[1]);
                            gl_Position = vec4(pos.xy, 0, 1);
                        }
                    `),
        primitive: 'triangles',
        attributes: {
          position: regl.prop<CommandProps, 'position'>('position'),
        },
        uniforms: {
          resolution: [sketchContext.width, sketchContext.height],
          pointilism: foreground.pointilism,
          noiselism: foreground.noiselism,
          offset: globalProps.offset,
          depthStrength: parallax.depthStrength,
          rotationStrength: parallax.rotationStrength,
          fromColor: regl.prop<CommandProps, 'fromColor'>('fromColor'),
          toColor: regl.prop<CommandProps, 'toColor'>('toColor'),
          tintColor: regl.prop<CommandProps, 'tintColor'>('tintColor'),
          isVert: regl.prop<CommandProps, 'isVert'>('isVert'),
          zIndex: regl.prop<CommandProps, 'zIndex'>('zIndex'),
        },
        count: 6,
      });

      const batchedProps: CommandProps[] = triangles.map((t, i) => {
        return {
          fromColor: convertHexToColor(rectProps[i].fromColor),
          toColor: convertHexToColor(rectProps[i].toColor),
          tintColor: convertHexToColor(rectProps[i].tintColor),
          position: [...t[0], ...t[1]],
          isVert: rectProps[i].isVert,
          zIndex: rectProps[i].zIndex,
        };
      });

      command(batchedProps);
    };

    const drawBackground = () => {
      const triangles = rectToTriangles([
        [0, 0],
        [sketchContext.width, sketchContext.height],
      ]);

      interface CommandProps {
        fromColor: Color;
        toColor: Color;
        tintColor: Color;
        position: Cord[];
      }

      const command = regl({
        frag: glslify(`
                        precision mediump float;

                        #pragma glslify: noise = require('glsl-noise/simplex/2d');
                        #pragma glslify: cnoise2 = require('glsl-noise/classic/2d'); 

                        uniform vec4 backgroundColor;
                        uniform vec4 tintColor;
                        uniform vec4 fromColor;
                        uniform vec4 toColor;
                        uniform float pointilism;
                        uniform float noiselism;
                        uniform vec2 resolution;
                        void main () {
                            vec2 cord = gl_FragCoord.xy / resolution;
                            vec4 color = mix(toColor, fromColor, cord.x);
                            float smooth_coeff = abs(noise(cord.xy * pointilism));
                            float noise_coeff = abs(cnoise2(cord.xy * noiselism));
                            float coeff = smooth_coeff * noise_coeff;
                            gl_FragColor = mix(color, tintColor, coeff);
                        }
                    `),
        vert: glslify(`
                        precision mediump float;

                        // uniforms
                        uniform vec2 resolution;

                        // attributes
                        attribute vec2 position;

                        void main () {
                            vec2 normalizedCords = vec2(2, 2) * (position / resolution);
                            normalizedCords *= vec2(1, -1);
                            normalizedCords += vec2(-1, 1);
                            gl_Position = vec4(normalizedCords, 0, 1);
                        }
                    `),
        primitive: 'triangles',
        attributes: {
          position: regl.prop<CommandProps, 'position'>('position'),
        },
        uniforms: {
          resolution: [sketchContext.width, sketchContext.height],
          pointilism: background.pointilism,
          noiselism: background.noiselism,
          toColor: regl.prop<CommandProps, 'toColor'>('toColor'),
          fromColor: regl.prop<CommandProps, 'fromColor'>('fromColor'),
          tintColor: regl.prop<CommandProps, 'tintColor'>('tintColor'),
        },
        count: 6,
      });

      command({
        fromColor: convertHexToColor(background.colors[0]),
        toColor: convertHexToColor(background.colors[1]),
        tintColor: convertHexToColor(background.tintColor),
        position: [...triangles[0], ...triangles[1]],
      });
    };

    // generates partitions in the units of the gridSize
    const generateGridPartitioningInGridUnits = (
      topLeft: Cord,
      bottomRight: Cord,
      vertOrHorzRatio = gridParitioning.vertOrHorzRatio,
    ): Line[] => {
      // if bounds is in effect a dot
      if (
        bottomRight[0] - topLeft[0] === 0 &&
        bottomRight[1] - topLeft[1] === 0
      ) {
        return [[topLeft, bottomRight]];
      }
      let isVert = rand() > vertOrHorzRatio;
      // if bound is a 1 by 2 line
      if (
        (bottomRight[0] - topLeft[0] === 1 &&
          bottomRight[1] - topLeft[1] === 0) ||
        (bottomRight[0] - topLeft[0] === 0 && bottomRight[1] - topLeft[1] === 1)
      ) {
        return [
          [topLeft, topLeft],
          [bottomRight, bottomRight],
        ];
      }
      // if bounds is in effect a 2 by 2 square
      if (
        bottomRight[0] - topLeft[0] === 1 &&
        bottomRight[1] - topLeft[1] === 1
      ) {
        if (isVert) {
          return [
            [topLeft, [bottomRight[0] - 1, bottomRight[1]]],
            [[topLeft[0] + 1, topLeft[1]], bottomRight],
          ];
        } else {
          return [
            [topLeft, [bottomRight[0], bottomRight[1] - 1]],
            [[topLeft[0], topLeft[1] + 1], bottomRight],
          ];
        }
      }

      const startPt: Cord = [
        isVert ? random(topLeft[0] + 1, bottomRight[0], 'int') : topLeft[0],
        isVert ? topLeft[1] : random(topLeft[1] + 1, bottomRight[1], 'int'),
      ];
      const endPt: Cord = [
        isVert ? startPt[0] : bottomRight[0],
        isVert ? bottomRight[1] : startPt[1],
      ];
      const line: Line = [startPt, endPt];
      const topOrLeftRect: Rect = [
        topLeft,
        [endPt[0] - (isVert ? 1 : 0), endPt[1] - (isVert ? 0 : 1)],
      ];
      const bottomOrRightRect: Rect = [
        [startPt[0] + (isVert ? 1 : 0), startPt[1] + (isVert ? 0 : 1)],
        bottomRight,
      ];
      // check if bounds are valid, if not provide no lines
      const isTopOrLeftRectValid =
        topOrLeftRect[1][0] >= topOrLeftRect[0][0] &&
        topOrLeftRect[1][1] >= topOrLeftRect[0][1];
      const isBottomOrRightRectValid =
        bottomOrRightRect[1][0] >= bottomOrRightRect[0][0] &&
        bottomOrRightRect[1][1] >= bottomOrRightRect[0][1];

      const ratio = !isVert
        ? vertOrHorzRatio / 2
        : vertOrHorzRatio + (1 - vertOrHorzRatio) / 2;
      return [
        ...(isTopOrLeftRectValid
          ? generateGridPartitioningInGridUnits(
              topOrLeftRect[0],
              topOrLeftRect[1],
              ratio,
            )
          : []),
        line,
        ...(isBottomOrRightRectValid
          ? generateGridPartitioningInGridUnits(
              bottomOrRightRect[0],
              bottomOrRightRect[1],
              ratio,
            )
          : []),
      ];
    };

    const convertGridLinesToRects = (
      lines: Line[],
      lineProps: any[],
    ): Rect[] => {
      const {unitSize, gridSizeInUnits, gap} = gridParitioning;

      const totalGridBounds = [
        unitSize[0] * gridSizeInUnits[0] + gap * (gridSizeInUnits[0] - 1),
        unitSize[1] * gridSizeInUnits[1] + gap * (gridSizeInUnits[1] - 1),
      ];

      const topLeft = [
        (sketchContext.width - totalGridBounds[0]) / 2,
        (sketchContext.height - totalGridBounds[1]) / 2,
      ];

      return lines
        .map((l, i) => {
          return [
            [l[0][0] * (unitSize[0] + gap), l[0][1] * (unitSize[1] + gap)],
            [
              (l[1][0] + lineProps[i].gitterRatio[0]) * (unitSize[0] + gap) -
                gap,
              (l[1][1] + lineProps[i].gitterRatio[1]) * (unitSize[1] + gap) -
                gap,
            ],
          ];
        })
        .map((r) => {
          return [
            [topLeft[0] + r[0][0], topLeft[1] + r[0][1]],
            [topLeft[0] + r[1][0], topLeft[1] + r[1][1]],
          ];
        });
    };

    const getAnimatedLinesWithAnimations = (lines: Line[], tick: number, anim: Animation): Line[] => {
      //assumes that the anim feed is the duration of the animation
      const completeTicksDuration =
        anim.startDelayInTicks + anim.durationInTicks + anim.endDelayInTicks;
      // for looping, the tick is set to cycle [0, completeTicksDuration]
      const relativeTick = tick % completeTicksDuration;
      if (relativeTick < anim.startDelayInTicks) {
        return lines.map(l => animateLine(l, 1));
      }
      if (relativeTick >= anim.startDelayInTicks && relativeTick <= (completeTicksDuration - anim.endDelayInTicks)) {
        if (anim.type === 'timeline') {
          const lineGroups: Line[][] = anim.subAnimations.map((a: Animation) => {
            const pickedLine = lines[a.props.lineIndex as number];
            return getAnimatedLinesWithAnimations([ pickedLine ], tick, a);
          });
          return flatten(lineGroups);
        }
        if (anim.type === 'breath') {
          const halfDurationInTicks = anim.durationInTicks / 2;
          const proportion = Math.abs(((relativeTick - anim.startDelayInTicks) - halfDurationInTicks) / halfDurationInTicks);
          return lines.map(l => animateLine(l, proportion));
        }
        return lines.map(l => animateLine(l, 1));
      }
      if (relativeTick > (completeTicksDuration - anim.endDelayInTicks)) {
        return lines.map(l => animateLine(l, 1));
      };
      return lines;
    };

    const animateLine = (l: Line, proportion: number): Line => {
      // if vert, scale the y value
      if (l[1][0] - l[0][0] === 0) {
        return [
          [
            l[0][0],
            l[0][1] +
              (l[1][1] - l[0][1]) *
                (proportion < 0.5 ? proportion * 2 : 1),
          ],
          [
            l[1][0],
            l[0][1] +
              (l[1][1] - l[0][1]) * (proportion < 0.5 ? proportion * 2 : 1),
          ],
        ];
      }
      // if horz, scale the x value
      if (l[1][1] - l[0][1] === 0) {
        return [
          [
            l[0][0] +
              (l[1][0] - l[0][0]) *
                (proportion > 0.5 ? (proportion - 0.5) * 2 : 0),
            l[0][1],
          ],
          [
            l[0][0] +
              (l[1][0] - l[0][0]) * (proportion < 0.5 ? proportion * 2 : 1),
            l[1][1],
          ],
        ];
      }
      return l;
    };

    // const animateLines = (
    //   lines: Line[],
    //   animateProportion: number,
    //   lineAnimationOptions: any[],
    // ): Line[] => {
    //   return lines.map((l, i) => {
    //     const options = lineAnimationOptions[i];
    //     let proportion = 0;
    //     if (animateProportion < options.startDelayProportion) {
    //       proportion = 0;
    //     } else if (animateProportion > 1 - options.endDelayProportion) {
    //       proportion = 1;
    //     } else if (
    //       animateProportion > (1 - options.fullWidthDelayProportion) / 2 &&
    //       animateProportion <
    //         (1 - options.fullWidthDelayProportion) / 2 +
    //           options.fullWidthDelayProportion
    //     ) {
    //       proportion = 0.5;
    //     } else {
    //       //rescale proportions to 0 - 1
    //       const startFullWidthDelay =
    //         (1 - options.fullWidthDelayProportion) / 2;
    //       const endFullWidthDelay =
    //         startFullWidthDelay + options.fullWidthDelayProportion;

    //       if (
    //         animateProportion >= options.startDelayProportion &&
    //         animateProportion <= startFullWidthDelay
    //       ) {
    //         proportion =
    //           0.5 *
    //           ((animateProportion - options.startDelayProportion) /
    //             (startFullWidthDelay - options.startDelayProportion));
    //       }
    //       if (
    //         animateProportion >= endFullWidthDelay &&
    //         animateProportion <= 1 - options.endDelayProportion
    //       ) {
    //         proportion =
    //           0.5 +
    //           (0.5 * (animateProportion - endFullWidthDelay)) /
    //             (1 - options.endDelayProportion - endFullWidthDelay);
    //       }
    //     }
    //     // if vert, scale the y value
    //     if (l[1][0] - l[0][0] === 0) {
    //       return [
    //         [
    //           l[0][0],
    //           l[0][1] +
    //             (l[1][1] - l[0][1]) *
    //               (proportion > 0.5 ? (proportion - 0.5) * 2 : 0),
    //         ],
    //         [
    //           l[1][0],
    //           l[0][1] +
    //             (l[1][1] - l[0][1]) * (proportion < 0.5 ? proportion * 2 : 1),
    //         ],
    //       ];
    //     }
    //     // if horz, scale the x value
    //     if (l[1][1] - l[0][1] === 0) {
    //       return [
    //         [
    //           l[0][0] +
    //             (l[1][0] - l[0][0]) *
    //               (proportion > 0.5 ? (proportion - 0.5) * 2 : 0),
    //           l[0][1],
    //         ],
    //         [
    //           l[0][0] +
    //             (l[1][0] - l[0][0]) * (proportion < 0.5 ? proportion * 2 : 1),
    //           l[1][1],
    //         ],
    //       ];
    //     }
    //     return l;
    //   });
    // };

    const animate = () => {
      const {offsetStrength} = parallax;
      const {gitter} = gridLinesToRects;
      const {gridSizeInUnits} = gridParitioning;
      const lines = generateGridPartitioningInGridUnits(
        [0, 0],
        gridSizeInUnits,
      );
      const lineProps = lines.map((l) => {
        const gitterRatio = [1 - random(...gitter), 1 - random(...gitter)];
        return {
          gitterRatio,
        };
      });
      const rectProps = newArray(lines.length).map((_: any, i: number) => {
        const isVert = lines[i][0][0] === lines[i][1][0];
        const colorPt: Cord = [
          (foreground.colorPointilism * (lines[i][0][0] + lines[i][1][0])) / 2,
          (foreground.colorPointilism * (lines[i][0][1] + lines[i][1][1])) / 2,
        ];
        // generally simplex has a noise from [0.7xx, 0.7xx]
        const colorPalleteIndex = Math.min(
          Math.floor(
            (Math.abs(simplex.noise2D(...colorPt)) / 0.9) *
              foreground.colorPalletes.length,
          ),
          foreground.colorPalletes.length - 1,
        );

        const startDelayInTicks =
          Math.floor(animation.bloomMaxStartDelayInTicks *
          (Math.abs(
            simplex.noise2D(
              colorPt[0] + colorPalleteIndex,
              colorPt[1] + colorPalleteIndex,
            ),
          ) /
            0.9));
        const colorIndex = random(
          0,
          foreground.colorPalletes[colorPalleteIndex].length,
          'int',
        );

        return {
          fromColor: foreground.colorPalletes[colorPalleteIndex][colorIndex],
          toColor: foreground.colorPalletes[colorPalleteIndex][colorIndex],
          tintColor: foreground.tintColors[colorPalleteIndex],
          isVert,
          zIndex: i % 10, // TODO
          startDelayInTicks,
        };
      });

      const durationInTicks = Math.max(...rectProps.map((r: any) => r.startDelayInTicks)) + animation.breathDurationInTicks;

      const timelineAnimation: Animation = {
        startDelayInTicks: animation.startDelayInTicks,
        durationInTicks,
        endDelayInTicks: animation.endDelayInTicks,
        props: {},
        type: 'timeline',
        subAnimations: rectProps.map((r: any, i: number) => {
          return {
            startDelayInTicks: r.startDelayInTicks,
            durationInTicks: animation.breathDurationInTicks,
            endDelayInTicks: durationInTicks - animation.breathDurationInTicks - r.startDelayInTicks,
            props: { lineIndex: i },
            type: 'breath',
            subAnimations: [],
          }
        }), 
      }

      let lastIsMouseInCanvasTick = 0;

      regl.frame(({tick}) => {

        const animatedLines = getAnimatedLinesWithAnimations(
          lines,
          tick,
          timelineAnimation,
        );

        const rects = convertGridLinesToRects(animatedLines, lineProps);
        let offset = [
          (mouseCords[0] - sketchContext.width / 2) * offsetStrength[0] * -1,
          (mouseCords[1] - sketchContext.height / 2) * offsetStrength[1] * -1,
        ];
        if (!isMouseInCanvas) {
          const offsetReturnCoeff =
            1 -
            Math.pow(
              Math.min(
                tick - lastIsMouseInCanvasTick,
                parallax.animationTickCount,
              ) / parallax.animationTickCount,
              2,
            );
          offset = [
            offset[0] * offsetReturnCoeff,
            offset[1] * offsetReturnCoeff,
          ];
        } else {
          lastIsMouseInCanvasTick = tick;
        }
        const globalProps = {
          offset,
        };
        drawSimpleRects(rects, rectProps, globalProps);
        drawBackground();
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      // sketch context is scaled to fit the screen, so the resolution to export can be not the same as viewport dimensions
      const {offsetX, offsetY} = e;
      mouseCords = [
        Math.round((offsetX / sketchContext.styleWidth) * sketchContext.width),
        Math.round(
          (offsetY / sketchContext.styleHeight) * sketchContext.height,
        ),
      ];
    };

    const handleMouseEnter = (e: MouseEvent) => {
      isMouseInCanvas = true;
    };

    const handleMouseLeave = (e: MouseEvent) => {
      isMouseInCanvas = false;
    };

    // connect listeners
    sketchContext.canvas.addEventListener('mousemove', handleMouseMove);
    sketchContext.canvas.addEventListener('mouseenter', handleMouseEnter);
    sketchContext.canvas.addEventListener('mouseleave', handleMouseLeave);

    return {
      render: () => {
        start();
        animate();
      },
      end: () => {
        sketchContext.canvas.removeEventListener('mousemove', handleMouseMove);
      },
    };
  };
};
