/* globals describe, it */
const chai = require('chai');

const { expect, } = chai;

const pdftk = require('../');
const fs = require('fs');
const path = require('path');

describe('background', function () {

    it('should add background file to pdf with file path input and background file', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/background.temp.pdf'));
        const input = path.join(__dirname, './files/form.pdf');
        const background = path.join(__dirname, './files/logo.pdf');

        return pdftk
            .input(input)
            .background(background)
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should add background file to pdf with file path input and background buffer', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/background.temp.pdf'));
        const input = path.join(__dirname, './files/form.pdf');
        const background = fs.readFileSync(path.join(__dirname, './files/logo.pdf'));

        return pdftk
            .input(input)
            .background(background)
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should add background file to pdf with buffer input and background file path', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/background.temp.pdf'));
        const input = fs.readFileSync(path.join(__dirname, './files/form.pdf'));
        const background = path.join(__dirname, './files/logo.pdf');

        return pdftk
            .input(input)
            .background(background)
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should write an output file with the output method', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/background.temp.pdf'));
        const input = fs.readFileSync(path.join(__dirname, './files/form.pdf'));
        const background = path.join(__dirname, './files/logo.pdf');
        const output = path.join(__dirname, './files/output.background.temp.pdf');

        return pdftk
            .input(input)
            .background(background)
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

    it('should catch an error with a bad input file', function () {

        const input = path.join(__dirname, './files/doesnotexist.pdf');
        const background = fs.readFileSync(path.join(__dirname, './files/logo.pdf'));

        return pdftk
            .input(input)
            .background(background)
            .output()
            .then(buffer => expect(buffer).to.be.null)
            .catch(err => expect(err).to.not.be.null);
    });

    it('should catch an error with a bad background file', function () {

        const input = path.join(__dirname, './files/form.pdf');
        const background = path.join(__dirname, './files/doesnotexist.pdf');

        return pdftk
            .input(input)
            .background(background)
            .output()
            .then(buffer => expect(buffer).to.be.null)
            .catch(err => expect(err).to.not.be.null);
    });

    it('should catch an error with a bad output file', function () {

        const input = path.join(__dirname, './files/form.pdf');
        const background = path.join(__dirname, './files/logo.pdf');
        const output = path.join(__dirname, './path/does/not/exist.pdf');

        return pdftk
            .input(input)
            .background(background)
            .output(output)
            .then(buffer => expect(buffer).to.be.null)
            .catch(err => expect(err).to.not.be.null);
    });


});
