import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/bundle.js',
            format: 'esm',
        }
    ],
    plugins: [
        babel({exclude: 'node_modules/**'}),
        typescript()
    ]
}
