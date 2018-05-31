/* globals beforeEach, describe, it */
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
            .then(function (buffer) {
                expect(buffer.equals(testFile)).to.be.true;
            })
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
            .then(function (buffer) {
                expect(buffer.equals(testFile)).to.be.true;
            })
    });


    it('Stamp PDF', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/stamp.temp.pdf'));

        return pdftk
            .input(path.join(__dirname, './files/form.pdf'))
            .stamp(path.join(__dirname, './files/logo.pdf'))
            .output()
            .then(function (buffer) {
                expect(buffer.equals(testFile)).to.be.true;
            })
    });


    it('Catenate Pages', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/documentcat.temp.pdf'));
        return pdftk
            .input({
                A: path.join(__dirname, './files/document1.pdf',),
                B: path.join(__dirname, './files/document2.pdf',),
            })
            .cat('A B')
            .output()
            .then(function (buffer) {
                // this one is tricky because these lines change every time a file gets created, so they can't be directly compared
                // ------------------
                // 0xB595: /ModDate
                // 0xB5B8: /CreationDate
                // 0xBB98: /ID
                //-------------------
                // compare the bits around the changes
                // expect(buffer.compare(testFile, 0x0000, 0xB5A0, 0x0000, 0xB5A0)).to.equal(0);
                // expect(buffer.compare(testFile, 0xB5B6, 0xB5C8, 0xB5B6, 0xB5C8)).to.equal(0);
                // expect(buffer.compare(testFile, 0xB5DE, 0xBBA0, 0xB5DE, 0xBBA0)).to.equal(0);
                console.log(buffer);
                expect(buffer.equals(testFile)).to.be.true;
            });
    });


})
