/* globals describe, it */

const { expect, } = require('chai');

const pdftk = require('../');
const fs = require('fs');
const path = require('path');

describe('background', function () {
    this.slow(250);


    it('should add first page of background file to all pages of a pdf', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/background.temp.pdf'));

        return pdftk
            .input(path.join(__dirname, './files/form.pdf'))
            .background(path.join(__dirname, './files/logo-multiple-pages.pdf'))
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true);
    });


});
