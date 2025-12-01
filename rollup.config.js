import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

const external = [
  'react',
  'react-dom',
  'axios',
  'crypto-js',
  'node-cache',
  'p-retry',
  'pino',
  'uuid',
  'zod',
];

export default [
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'es',
      sourcemap: true,
    },
    external,
    plugins: [
      resolve({
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        module: 'esnext',
      }),
    ],
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    external,
    plugins: [
      resolve({
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        module: 'esnext',
      }),
    ],
  },
  // TypeScript declarations
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    external,
    plugins: [dts()],
  },
];

