const lint = require('mocha-eslint');

const paths = [
    'index.js',
    'test/*.js',
];

lint(paths);
