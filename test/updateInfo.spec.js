/* globals describe, it */
const chai = require('chai');

const { expect, } = chai;

const pdftk = require('../');
const path = require('path');

const sample = `InfoBegin
InfoKey: ModDate
InfoValue: D:20190809100746+10'00'
InfoBegin
InfoKey: CreationDate
InfoValue: D:20190809100746+10'00'
InfoBegin
InfoKey: Creator
InfoValue: pdftk 2.02 - www.pdftk.com
InfoBegin
InfoKey: Producer
InfoValue: itext-paulo-155 (itextpdf.sf.net-lowagie.com)
PdfID0: b65ba3f658853c3c8df5d33b06e31195
PdfID1: b9f57d4e3b9b1162bb14654fe4d534c0
NumberOfPages: 6
BookmarkBegin
BookmarkTitle: Bookmark test Level 1
BookmarkLevel: 1
BookmarkPageNumber: 1
BookmarkBegin
BookmarkTitle: Bookmark test Level 2
BookmarkLevel: 2
BookmarkPageNumber: 1
BookmarkBegin
BookmarkTitle: Bookmark test Level 2-2
BookmarkLevel: 2
BookmarkPageNumber: 2
BookmarkBegin
BookmarkTitle: Bookmark test Level 3
BookmarkLevel: 3
BookmarkPageNumber: 5
PageMediaBegin
PageMediaNumber: 1
PageMediaRotation: 0
PageMediaRect: 0 0 594.96 841.92
PageMediaDimensions: 594.96 841.92
PageMediaBegin
PageMediaNumber: 2
PageMediaRotation: 0
PageMediaRect: 0 0 594.96 841.92
PageMediaDimensions: 594.96 841.92
PageMediaBegin
PageMediaNumber: 3
PageMediaRotation: 0
PageMediaRect: 0 0 594.96 841.92
PageMediaDimensions: 594.96 841.92
PageMediaBegin
PageMediaNumber: 4
PageMediaRotation: 0
PageMediaRect: 0 0 594.96 841.92
PageMediaDimensions: 594.96 841.92
PageMediaBegin
PageMediaNumber: 5
PageMediaRotation: 0
PageMediaRect: 0 0 594.96 841.92
PageMediaDimensions: 594.96 841.92
PageMediaBegin
PageMediaNumber: 6
PageMediaRotation: 0
PageMediaRect: 0 0 594.96 841.92
PageMediaDimensions: 594.96 841.92`;

describe('updateInfo', function () {

    it('serialise and deserialise the info object with equal results', function () {
        const serialised = pdftk.PdfTk.infoStringToObject(sample);
        const deserialised = pdftk.PdfTk.infoObjectToString(serialised);
        expect(sample).to.equal(deserialised);
    });
    it('should parse info from dumpdata correctly to show number of pages', function () {
        const input = path.join(__dirname, './files/document1.pdf');
        return pdftk
            .input(input)
            .dumpData()
            .output()
            .then(buffer => pdftk.PdfTk.infoStringToObject(buffer.toString('utf8')))
            .then(object => expect(parseInt(object.NumberOfPages)).to.equal(5));

    });
    it('should write output file with added bookmarks', function () {
        const strToObj = pdftk.PdfTk.infoStringToObject;
        const input = path.join(__dirname, './files/document1.pdf');
        const output = path.join(__dirname, './files/updateinfo.temp.pdf');
        const newBookmark = { Title: 'Bookmark test title', Level: '1', PageNumber: '1', };

        const dumpData = () => pdftk
            .input(input)
            .dumpData()
            .output()
            .then(buffer => buffer.toString('utf8'));

        const addBookmark = () =>
            dumpData().then(data => strToObj(data)).then(infoObject => {
                infoObject.Bookmark = [
                    newBookmark,
                ];
                return infoObject;
            });

        const writeFileWithUpdates = () =>
            addBookmark().then(infoObject =>
                pdftk
                    .input(input)
                    .updateInfo(infoObject)
                    .output(output));


        return writeFileWithUpdates().then(() =>
            pdftk
                .input(output)
                .dumpData()
                .output()
                .then(buffer => pdftk.PdfTk.infoStringToObject(buffer.toString('utf8')))
                .then(obj => expect(obj.Bookmark[0].Title).to.equal(newBookmark.Title)));

    });
});
