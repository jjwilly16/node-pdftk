/* globals describe, it */
const chai = require('chai');

const { expect, } = chai;

const pdftk = require('../');
const fs = require('fs');
const path = require('path');

describe('generateFormDataJson', function () {

    it('should generate a json file from the fdf of an unfilled pdf', function () {

        const testFile = JSON.parse(fs.readFileSync(path.join(__dirname, './files/emptyform.json')));
        const input = path.join(__dirname, './files/form.pdf');

        return pdftk
            .input(input)
            .generateFdf()
            .output()
            .then(buffer => expect(pdftk.fdfToJson(buffer)).to.eql(testFile))
            .catch(err => expect(err).to.be.null);
    });

    it('should generate an json file from the fdf of a filled pdf', function () {

        const testFile = JSON.parse(fs.readFileSync(path.join(__dirname, './files/filledform.json')));
        const input = fs.readFileSync(path.join(__dirname, './files/filledform.temp.pdf'));

        return pdftk
            .input(input)
            .generateFdf()
            .output()
            .then(buffer => {
                expect(pdftk.fdfToJson(buffer)).to.deep.equal(testFile);
            })
            .catch(err => expect(err).to.be.null);
    });

    it('should generate an json file from the fdf of a number filled pdf', function () {

        const testFile = JSON.parse(fs.readFileSync(path.join(__dirname, './files/filledformwithnumber.json')));
        const input = fs.readFileSync(path.join(__dirname, './files/filledformwithnumber.temp.pdf'));

        return pdftk
            .input(input)
            .generateFdf()
            .output()
            .then(buffer => expect(pdftk.fdfToJson(buffer)).to.eql(testFile))
            .catch(err => expect(err).to.be.null);
    });

    it('should throw and TypeError if the buffer is not an fdf', function () {

        const input = path.join(__dirname, './files/form.pdf');

        return pdftk
            .input(input)
            .output()
            .then(buffer => pdftk.fdfToJson(buffer))
            .catch(err => {
                expect(err.name).to.equal('TypeError');
                expect(err.message).to.equal('Function must be called on generated FDF output');
            });
    });
});
