/* globals describe, it */

const { expect, } = require('chai');

const pdftk = require('../');
const fs = require('fs');
const path = require('path');

describe('fillForm', function () {
    this.slow(250);


    it('should fill a form without flattening it', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/filledform.temp.pdf'));

        return pdftk
            .input(path.join(__dirname, './files/form.pdf'))
            .fillForm({
                name: 'John Doe',
                email: 'test@email.com',
            })
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true);
    });


    it('fill a form and flatten it', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/filledformflat.temp.pdf'));

        return pdftk
            .input(path.join(__dirname, './files/form.pdf'))
            .fillForm({
                name: 'John Doe',
                email: 'test@email.com',
            })
            .flatten()
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true);
    });


});
