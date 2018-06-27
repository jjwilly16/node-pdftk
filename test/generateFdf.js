/* globals describe, it */
const chai = require('chai');

const { expect, } = chai;

const pdftk = require('../');
const fs = require('fs');
const path = require('path');

describe('generateFdf', function () {
    this.slow(250);


    it('generate an fdf file from a pdf', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/form.temp.fdf'));

        return pdftk
            .input(path.join(__dirname, './files/form.pdf'))
            .generateFdf()
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true);
    });


});
