import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

const external = [
  'react',
  'react-dom',
  'axios', // Keep external - consumers likely have their own axios instance
  'zod',
  // Bundle these smaller dependencies so consumers don't need to install them
  // 'crypto-js',  // Bundled - implementation detail
  // 'p-retry',    // Bundled - implementation detail
  // 'uuid',       // Bundled - implementation detail
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
        resolveOnly: [], // Resolve all modules from node_modules for bundling
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
        resolveOnly: [], // Resolve all modules from node_modules for bundling
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

