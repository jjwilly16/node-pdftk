/* globals describe, it, before, after */
const chai = require('chai');

const { expect, } = chai;

const pdftk = require('../');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

describe('option - tempDir', function () {

    const tempDir = path.join(__dirname, 'my-tmp-dir');

    before(function () {
        fs.mkdirSync(tempDir);
    });

    after(function () {
        rimraf(tempDir, function () { });
    });

    it('should use a custom temp directory', function () {

        pdftk.configure({
            tempDir,
        });

        // Need to pass in buffer in order to force temp file to be written
        const input = fs.readFileSync(path.join(__dirname, './files/form.pdf'));

        return pdftk
            .input(input)
            .fillForm({
                name: 'John Doe',
                email: 'test@email.com',
            })
            .output()
            .then(buffer => expect(buffer).to.not.be.null)
            .then(() => {
                pdftk.configure({
                    tempDir: path.join(__dirname, '../node-pdftk-tmp/'),
                });
            })
            .catch(err => expect(err).to.be.null);
    });

});
