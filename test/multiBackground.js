/* globals describe, it */

const { expect, } = require('chai');

const pdftk = require('../');
const fs = require('fs');
const path = require('path');

describe('multiBackground', function () {
    this.slow(250);


    it('should add all pages of background file to a pdf', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/multibackground.temp.pdf'));

        return pdftk
            .input(path.join(__dirname, './files/document1.pdf'))
            .multiBackground(path.join(__dirname, './files/logo-multiple-pages.pdf'))
            .keepFinalId()
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true);
    });


});
