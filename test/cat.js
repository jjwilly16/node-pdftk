/* globals describe, it */

const { expect, } = require('chai');

const pdftk = require('../');
const fs = require('fs');
const path = require('path');

describe('cat', function () {
    this.slow(250);

    it('should catenate pages', function () {

        const testFile = fs.readFileSync(path.join(__dirname, './files/documentcat.temp.pdf'));
        return pdftk
            .input({
                A: fs.readFileSync(path.join(__dirname, './files/document1.pdf')),
                B: path.join(__dirname, './files/document2.pdf'),
            })
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
                    .updateInfoUtf8(path.join(__dirname, './files/documentcat.info'))
                    .output();
            })
            .then(buffer => expect(buffer.equals(testFile)).to.be.true);
    });


});
