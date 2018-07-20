/* globals describe, it */
const chai = require('chai');

const { expect, } = chai;

const pdftk = require('../');
const fs = require('fs');
const path = require('path');

describe('generateFdf', function () {

    it('should generate an fdf file from a pdf with a string input', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/form.temp.fdf'));
        const input = path.join(__dirname, './files/form.pdf');

        return pdftk
            .input(input)
            .generateFdf()
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should generate an fdf file from a pdf with a buffer input', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/form.temp.fdf'));
        const input = fs.readFileSync(path.join(__dirname, './files/form.pdf'));

        return pdftk
            .input(input)
            .generateFdf()
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should write an output file through the output method', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/form.temp.fdf'));
        const input = path.join(__dirname, './files/form.pdf');
        const output = path.join(__dirname, './files/output.temp.fdf');

        return pdftk
            .input(input)
            .generateFdf()
            .output(output)
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .then(() =>
                new Promise((resolve, reject) => {
                    let file;
                    try {
                        file = fs.readFileSync(output);
                    } catch (err) {
                        return reject(err);
                    }
                    return resolve(file);
                })
                    .then(buffer => expect(buffer.equals(testFile)).to.be.true))
            .catch(err => expect(err).to.be.null);
    });

    it('should catch an error if given a bad input path', function () {

        const input = path.join(__dirname, './files/doesnotexist.pdf');

        return pdftk
            .input(input)
            .generateFdf()
            .output()
            .then(buffer => expect(buffer).to.be.null)
            .catch(err => expect(err).to.not.be.null);
    });

    it('should catch an error if given a bad output path', function () {

        const input = path.join(__dirname, './files/doesnotexist.pdf');
        const output = path.join(__dirname, './path/does/not/exist.fdf');

        return pdftk
            .input(input)
            .generateFdf()
            .output(output)
            .then(buffer => expect(buffer).to.be.null)
            .catch(err => expect(err).to.not.be.null);
    });


});
