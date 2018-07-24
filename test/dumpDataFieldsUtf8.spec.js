/* globals describe, it */
const chai = require('chai');

const { expect, } = chai;

const pdftk = require('../');
const fs = require('fs');
const path = require('path');

describe('dumpDataFieldsUtf8', function () {

    it('should output data fields to file with file path input', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/form.fields.utf8.temp.info'));
        const input = path.join(__dirname, './files/form.pdf');

        return pdftk
            .input(input)
            .dumpDataFieldsUtf8()
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should output data fields to file with buffer input', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/form.fields.utf8.temp.info'));
        const input = fs.readFileSync(path.join(__dirname, './files/form.pdf'));

        return pdftk
            .input(input)
            .dumpDataFieldsUtf8()
            .output()
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should write an output file with the output method', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/form.fields.utf8.temp.info'));
        const input = fs.readFileSync(path.join(__dirname, './files/form.pdf'));
        const output = path.join(__dirname, './files/output.dumpdatafields.utf8.temp.info');

        return pdftk
            .input(input)
            .dumpDataFieldsUtf8()
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

    it('should catch an error if given bad file path', function () {

        const input = path.join(__dirname, './files/doesnotexist.pdf');

        return pdftk
            .input(input)
            .dumpDataFieldsUtf8()
            .output()
            .then(buffer => expect(buffer).to.be.null)
            .catch(err => expect(err).to.not.be.null);

    });


});
