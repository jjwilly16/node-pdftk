/* globals describe, it */
const chai = require('chai');

const expect = chai.expect;

const pdftk = require('../');
const fs = require('fs');
const path = require('path');

describe('PDFtk Tests', function () {
    this.slow(250);


    it('Fill a Form', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/filledform.temp.pdf'));

        return pdftk
            .input(path.join(__dirname, './files/form.pdf'))
            .fillForm({
                name: 'John Doe',
                email: 'test@email.com',
            })
            .output()
            .then(buffer =>
                expect(buffer.equals(testFile)).to.be.true
            );
    });


    it('Flatten Filled Form', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/filledformflat.temp.pdf'));

        return pdftk
            .input(path.join(__dirname, './files/form.pdf'))
            .fillForm({
                name: 'John Doe',
                email: 'test@email.com',
            })
            .flatten()
            .output()
            .then(buffer =>
                expect(buffer.equals(testFile)).to.be.true
            );
    });


});
