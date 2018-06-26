/* globals describe, it */
const chai = require('chai');

const expect = chai.expect;

const pdftk = require('../');
const fs = require('fs');
const path = require('path');

describe('PDFtk Tests', function () {
    this.slow(250);


    it('Generate FDF', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/form.temp.fdf'));

        return pdftk
            .input(path.join(__dirname, './files/form.pdf'))
            .generateFdf()
            .output()
            .then(buffer =>
                expect(buffer.equals(testFile)).to.be.true
            );
    });


});
