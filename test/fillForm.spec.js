/* globals describe, it */
const chai = require('chai');

const { expect, } = chai;

const pdftk = require('../');
const fs = require('fs');
const path = require('path');

describe('fillForm', function () {

    it('should fill a form without flattening it with a string input', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/filledform.temp.pdf'));
        const input = path.join(__dirname, './files/form.pdf');

        return pdftk
            .input(input)
            .fillForm({
                name: 'John Doe',
                email: 'test@email.com',
            })
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should fill a form without flattening it with a number input', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/filledformwithnumber.temp.pdf'));
        const input = path.join(__dirname, './files/form.pdf');

        return pdftk
            .input(input)
            .fillForm({
                name: 123,
                email: 'test@email.com',
            })
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should fill a form without flattening it with a buffer input', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/filledform.temp.pdf'));
        const input = fs.readFileSync(path.join(__dirname, './files/form.pdf'));

        return pdftk
            .input(input)
            .fillForm({
                name: 'John Doe',
                email: 'test@email.com',
            })
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });


    it('should fill a form and flatten it', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/filledformflat.temp.pdf'));
        const input = path.join(__dirname, './files/form.pdf');

        return pdftk
            .input(input)
            .fillForm({
                name: 'John Doe',
                email: 'test@email.com',
            })
            .flatten()
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should fill a form with an fdf file', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/filledform.temp.pdf'));
        const input = path.join(__dirname, './files/form.pdf');
        const fdfFile = path.join(__dirname, './files/form.fdf');

        return pdftk
            .input(input)
            .fillForm(fdfFile)
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should write an output file through the output method', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/filledformflat.temp.pdf'));
        const input = path.join(__dirname, './files/form.pdf');
        const output = path.join(__dirname, './files/output.filledformflat.temp.pdf');

        return pdftk
            .input(input)
            .fillForm({
                name: 'John Doe',
                email: 'test@email.com',
            })
            .flatten()
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
            .fillForm({
                name: 'John Doe',
                email: 'test@email.com',
            })
            .output()
            .then(buffer => expect(buffer).to.be.null)
            .catch(err => expect(err).to.not.be.null);
    });

    it('should catch an error if given a bad output path', function () {

        const input = path.join(__dirname, './files/form.pdf');
        const output = path.join(__dirname, './file/path/that/does/not/exist.pdf');

        return pdftk
            .input(input)
            .fillForm({
                name: 'John Doe',
                email: 'test@email.com',
            })
            .output(output)
            .then(buffer => expect(buffer).to.be.null)
            .catch(err => expect(err).to.not.be.null);
    });

    it('should catch an error if given bad form data', function () {

        const input = path.join(__dirname, './files/form.pdf');
        const output = path.join(__dirname, './files/output.filledformflat.temp.pdf');

        return pdftk
            .input(input)
            .fillForm('you will fail')
            .output(output)
            .then(buffer => expect(buffer).to.be.null)
            .catch(err => expect(err).to.not.be.null);
    });

});
