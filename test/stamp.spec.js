/* globals describe, it */
const chai = require('chai');

const { expect, } = chai;

const pdftk = require('../');
const fs = require('fs');
const path = require('path');

describe('stamp', function () {

    it('should stamp one pdf onto another with a string input and stamp file', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/stamp.temp.pdf'));
        const input = path.join(__dirname, './files/form.pdf');
        const stampFile = path.join(__dirname, './files/logo.pdf');

        return pdftk
            .input(input)
            .stamp(stampFile)
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should stamp one pdf onto another with a buffer input', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/stamp.temp.pdf'));
        const input = fs.readFileSync(path.join(__dirname, './files/form.pdf'));
        const stampFile = path.join(__dirname, './files/logo.pdf');

        return pdftk
            .input(input)
            .stamp(stampFile)
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should stamp one pdf onto another with a buffer stamp file', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/stamp.temp.pdf'));
        const input = path.join(__dirname, './files/form.pdf');
        const stampFile = fs.readFileSync(path.join(__dirname, './files/logo.pdf'));

        return pdftk
            .input(input)
            .stamp(stampFile)
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should stamp one pdf onto another with a buffer input and stamp file', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/stamp.temp.pdf'));
        const input = fs.readFileSync(path.join(__dirname, './files/form.pdf'));
        const stampFile = fs.readFileSync(path.join(__dirname, './files/logo.pdf'));

        return pdftk
            .input(input)
            .stamp(stampFile)
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should write an output file through the output method', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/stamp.temp.pdf'));
        const input = path.join(__dirname, './files/form.pdf');
        const stampFile = path.join(__dirname, './files/logo.pdf');
        const output = path.join(__dirname, './files/output.stamp.temp.pdf');

        return pdftk
            .input(input)
            .stamp(stampFile)
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
        const stampFile = path.join(__dirname, './files/logo.pdf');

        return pdftk
            .input(input)
            .stamp(stampFile)
            .output()
            .then(buffer => expect(buffer).to.be.null)
            .catch(err => expect(err).to.not.be.null);
    });

    it('should catch an error if given a bad stampfile path', function () {

        const input = path.join(__dirname, './files/form.pdf');
        const stampFile = path.join(__dirname, './files/doesnotexist.pdf');

        return pdftk
            .input(input)
            .stamp(stampFile)
            .output()
            .then(buffer => expect(buffer).to.be.null)
            .catch(err => expect(err).to.not.be.null);
    });

    it('should catch an error if given a bad output path', function () {

        const input = path.join(__dirname, './files/form.pdf');
        const stampFile = path.join(__dirname, './files/logo.pdf');
        const output = path.join(__dirname, './file/path/that/does/not/exist.pdf');

        return pdftk
            .input(input)
            .stamp(stampFile)
            .output(output)
            .then(buffer => expect(buffer).to.be.null)
            .catch(err => expect(err).to.not.be.null);
    });

});
