/* globals describe, it */
const chai = require('chai');

const { expect, } = chai;

const pdftk = require('../');
const fs = require('fs');
const path = require('path');

describe('cat', function () {

    it('should catenate pages with filepath inputs', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/documentcat.temp.pdf'));
        const input = [
            path.join(__dirname, './files/document1.pdf'),
            path.join(__dirname, './files/document2.pdf'),
        ];
        const infoFile = path.join(__dirname, './files/documentcat.info');

        return pdftk
            .input(input)
            .cat()
            .keepFinalId()
            .output()
            .then(function (buffer) {
                // this one is tricky because these lines change every time a file gets created, so they can't be directly compared
                // ------------------
                // 0xB595: /ModDate
                // 0xB5B8: /CreationDate
                // 0xBB98: /ID
                //-------------------

                // Need to run updateInfo to have the metadata match the test file

                return pdftk
                    .input(buffer)
                    .updateInfoUtf8(infoFile)
                    .output();
            })
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should catenate pages with buffer inputs', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/documentcat.temp.pdf'));
        const input = [
            fs.readFileSync(path.join(__dirname, './files/document1.pdf')),
            fs.readFileSync(path.join(__dirname, './files/document2.pdf')),
        ];
        const infoFile = path.join(__dirname, './files/documentcat.info');

        return pdftk
            .input(input)
            .cat()
            .keepFinalId()
            .output()
            .then(function (buffer) {
                // this one is tricky because these lines change every time a file gets created, so they can't be directly compared
                // ------------------
                // 0xB595: /ModDate
                // 0xB5B8: /CreationDate
                // 0xBB98: /ID
                //-------------------

                // Need to run updateInfo to have the metadata match the test file

                return pdftk
                    .input(buffer)
                    .updateInfoUtf8(infoFile)
                    .output();
            })
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should catenate pages with handles and filepath inputs', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/documentcat.temp.pdf'));
        const input = {
            A: path.join(__dirname, './files/document1.pdf'),
            B: path.join(__dirname, './files/document2.pdf'),
        };
        const infoFile = path.join(__dirname, './files/documentcat.info');

        return pdftk
            .input(input)
            .cat('A B')
            .keepFinalId()
            .output()
            .then(function (buffer) {
                // this one is tricky because these lines change every time a file gets created, so they can't be directly compared
                // ------------------
                // 0xB595: /ModDate
                // 0xB5B8: /CreationDate
                // 0xBB98: /ID
                //-------------------

                // Need to run updateInfo to have the metadata match the test file

                return pdftk
                    .input(buffer)
                    .updateInfoUtf8(infoFile)
                    .output();
            })
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should catenate pages with handles and an array cat command', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/documentcat.temp.pdf'));
        const input = {
            A: path.join(__dirname, './files/document1.pdf'),
            B: path.join(__dirname, './files/document2.pdf'),
        };
        const infoFile = path.join(__dirname, './files/documentcat.info');

        return pdftk
            .input(input)
            .cat([
                'A',
                'B',
            ])
            .keepFinalId()
            .output()
            .then(function (buffer) {
                // this one is tricky because these lines change every time a file gets created, so they can't be directly compared
                // ------------------
                // 0xB595: /ModDate
                // 0xB5B8: /CreationDate
                // 0xBB98: /ID
                //-------------------

                // Need to run updateInfo to have the metadata match the test file

                return pdftk
                    .input(buffer)
                    .updateInfoUtf8(infoFile)
                    .output();
            })
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should catenate pages with handles and buffer inputs', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/documentcat.temp.pdf'));
        const input = {
            A: fs.readFileSync(path.join(__dirname, './files/document1.pdf')),
            B: fs.readFileSync(path.join(__dirname, './files/document2.pdf')),
        };
        const infoFile = path.join(__dirname, './files/documentcat.info');

        return pdftk
            .input(input)
            .cat('A B')
            .keepFinalId()
            .output()
            .then(function (buffer) {
                // this one is tricky because these lines change every time a file gets created, so they can't be directly compared
                // ------------------
                // 0xB595: /ModDate
                // 0xB5B8: /CreationDate
                // 0xBB98: /ID
                //-------------------

                // Need to run updateInfo to have the metadata match the test file

                return pdftk
                    .input(buffer)
                    .updateInfoUtf8(infoFile)
                    .output();
            })
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should write an output file through the output method', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/documentcat.temp.pdf'));
        const input = {
            A: fs.readFileSync(path.join(__dirname, './files/document1.pdf')),
            B: fs.readFileSync(path.join(__dirname, './files/document2.pdf')),
        };
        const infoFile = path.join(__dirname, './files/documentcat.info');
        const output = path.join(__dirname, './files/output.cat.temp.pdf');

        return pdftk
            .input(input)
            .cat('A B')
            .keepFinalId()
            .output(output)
            .then(function () {
                // this one is tricky because these lines change every time a file gets created, so they can't be directly compared
                // ------------------
                // 0xB595: /ModDate
                // 0xB5B8: /CreationDate
                // 0xBB98: /ID
                //-------------------

                // Need to run updateInfo to have the metadata match the test file

                return pdftk
                    .input(output)
                    .updateInfoUtf8(infoFile)
                    .output();
            })
            .then(buffer => expect(buffer.equals(testFile)).to.be.true)
            .catch(err => expect(err).to.be.null);
    });

    it('should catch an error with a bad file input', function () {

        const input = {
            A: path.join(__dirname, './files/doesnotexist.pdf'),
            B: path.join(__dirname, './files/document2.pdf'),
        };
        const infoFile = path.join(__dirname, './files/documentcat.info');

        return pdftk
            .input(input)
            .cat('A B')
            .keepFinalId()
            .output()
            .then(function (buffer) {
                // this one is tricky because these lines change every time a file gets created, so they can't be directly compared
                // ------------------
                // 0xB595: /ModDate
                // 0xB5B8: /CreationDate
                // 0xBB98: /ID
                //-------------------

                // Need to run updateInfo to have the metadata match the test file

                return pdftk
                    .input(buffer)
                    .updateInfoUtf8(infoFile)
                    .output();
            })
            .then(buffer => expect(buffer).to.be.null)
            .catch(err => expect(err).to.not.be.null);
    });

    it('should catch an error with a bad output path', function () {

        const input = {
            A: fs.readFileSync(path.join(__dirname, './files/document1.pdf')),
            B: fs.readFileSync(path.join(__dirname, './files/document2.pdf')),
        };
        const infoFile = path.join(__dirname, './files/documentcat.info');
        const output = path.join(__dirname, './file/path/that/does/not/exist.pdf');

        return pdftk
            .input(input)
            .cat('A B')
            .keepFinalId()
            .output(output)
            .then(function (buffer) {
                // this one is tricky because these lines change every time a file gets created, so they can't be directly compared
                // ------------------
                // 0xB595: /ModDate
                // 0xB5B8: /CreationDate
                // 0xBB98: /ID
                //-------------------

                // Need to run updateInfo to have the metadata match the test file

                return pdftk
                    .input(output)
                    .updateInfoUtf8(infoFile)
                    .output();
            })
            .then(buffer => expect(buffer).to.be.null)
            .catch(err => expect(err).to.not.be.null);
    });


});
