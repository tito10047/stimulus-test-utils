import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/register.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
  treeshake: true,
  splitting: false,
})
