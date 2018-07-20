const lint = require('mocha-eslint');

const paths = [
    'index.js',
    'test/*.spec.js',
];

lint(paths);
