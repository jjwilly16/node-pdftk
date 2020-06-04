/* globals describe, it */
const chai = require('chai');
const fs = require('fs');

const assertArrays = require('chai-arrays');
const assertFs = require('chai-fs');

chai.use(assertFs);
chai.use(assertArrays);

const { expect, } = chai;
const path = require('path');
const pdftk = require('..');

describe('burst', function () {

    it('should return array of buffers if option returnMany is applied', function () {
        const input = path.join(__dirname, './files/document1.pdf');
        const pathTemplate = path.join(__dirname, './.tmp/page_%03d.pdf');

        return pdftk
            .input(input)
            .burst(pathTemplate, { returnMany: true, })
            .then(res => {
                expect(res).to.be.array();
                res.every(b => expect(b).to.be.instanceof(Buffer));
                expect(path.dirname(pathTemplate)).to.not.be.a.path();
            });
    }); //saveResults

    it('should save file directory if option saveResults is applied', function () {
        const input = path.join(__dirname, './files/document1.pdf');
        const pathTemplate = path.join(__dirname, './files/bursts.temp.dir/page_%03d.pdf');

        return pdftk
            .input(input)
            .burst(pathTemplate, { returnMany: true, saveResults: true, })
            .then(res => {
                expect(res).to.be.array();
                console.log(pathTemplate);
                expect(path.dirname(pathTemplate)).to.be.a.path();
            });
    });

    it('should not save files permanently in not existing directories by default', function () {
        const input = path.join(__dirname, './files/document1.pdf');
        const pathTemplate = path.join(__dirname, './files/bursts.temp.non_existing_dir/page_%03d.pdf');
        const location = path.join(path.dirname(pathTemplate), 'pg_0001.pdf');

        return pdftk
            .input(input)
            .burst(pathTemplate)
            .then(res => {
                expect(location).to.not.be.a.path();
            }).catch(e => {
                console.log(e);
            });
    });

    it('should work without any parameter and be compatible with spec from #39', function () {
        const input = path.join(__dirname, './files/document1.pdf');

        return pdftk
            .input(input)
            .burst()
            .then(() => {
                expect(path.join(process.cwd(), 'pg_0001.pdf')).to.be.a.path();
                for (let i = 1; i <= 5; i++) {
                    fs.unlinkSync(path.join(process.cwd(), `pg_000${i}.pdf`));
                }
                fs.unlinkSync(path.join(process.cwd(), 'doc_data.txt'));
            });
    });

});
