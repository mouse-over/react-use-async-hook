const { NODE_ENV } = process.env;

module.exports = {
    presets: [
        [
            '@babel/react',

        ]
    ],
    plugins: [
        NODE_ENV === 'test' && '@babel/transform-modules-commonjs',
        "@babel/plugin-proposal-export-default-from"
    ].filter(Boolean)
};