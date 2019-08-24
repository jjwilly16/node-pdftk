'use strict';

const { spawn, } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * PdfTk Class
 * @class
 */
class PdfTk {

    /**
     * PdfTk constructor.
     * @param {Array} src - Input source file(s).
     * @param {Array} [tmpFiles] - Array of temp files that have been created while initializing the constructor.
     * @returns {Object} PdfTk class instance.
     */
    constructor(src) {

        try {

            /**
             * Promise library to use
             * @member
             * @type {Object}
             */
            this._Promise = this._Promise || Promise;

            /**
             * PdfTk binary path
             * @member
             * @type {String}
             */
            this._bin = this._bin || process.env.PDFTK_PATH || 'pdftk';

            /**
             * Allows the plugin to ignore the PDFTK warnings. Useful with huge PDF files.
             * @member
             * @type {Boolean}
             */
            this._ignoreWarnings = this._ignoreWarnings || false;

            /**
             * Allows the plugin to change where the temp file is written.
             * @member
             * @type {String}
             */
            this._tempDir = this._tempDir || path.join(__dirname, './node-pdftk-tmp/');


            const input = [];

            /**
             * @member
             * @type {Array}
             */
            this.tmpFiles = [];

            /**
             * Write a temp file and save the path for deletion later.
             * @private
             * @function
             * @param {Object} srcFile - Buffer to be written as a temp file.
             * @returns {String} Path of the newly created temp file.
             */
            const writeTempFile = srcFile => {
                const tmpPath = this._tempDir;
                const uniqueId = crypto.randomBytes(16).toString('hex');
                const tmpFile = path.normalize(`${tmpPath}/${uniqueId}.pdf`);
                fs.writeFileSync(tmpFile, srcFile);
                this.tmpFiles.push(tmpFile);
                return tmpFile;
            };

            /**
             * Make sure input src is an array
             */
            src = Array.isArray(src) ? src : [
                src,
            ];

            /**
             * Loop through src and push to input array
             */
            for (const srcFile of src) {
                if (Buffer.isBuffer(srcFile)) {
                    input.push(writeTempFile(srcFile));
                } else if (PdfTk.isObject(srcFile)) {
                    for (const handle in srcFile) {
                        /* istanbul ignore else  */
                        if (srcFile.hasOwnProperty(handle)) {
                            if (Buffer.isBuffer(srcFile[handle])) {
                                input.push(`${handle}=${writeTempFile(srcFile[handle])}`);
                            } else {
                                input.push(`${handle}=${srcFile[handle]}`);
                            }
                        }
                    }
                } else {
                    input.push(srcFile);
                }
            }

            /**
             * @member
             * @type {Array}
             */
            this.src = input;

            /**
             * @member
             * @type {Array}
             */
            this.args = [].concat(this.src);

            /**
             * @member
             * @type {Array}
             */
            this.postArgs = [];

        } catch (err) {
            this.error = err;
        }

        return this;

    }

    /**
     * Simple object check. Arrays not included.
     * @static
     * @public
     * @param item - Item to check.
     * @returns {Boolean} Is object.
     */
    static isObject(item) {
        return typeof item === 'object' && !Array.isArray(item) && item !== null;
    }

    /**
     * Simple string check.
     * @static
     * @public
     * @param item - Item to check.
     * @returns {Boolean} Is string.
     */
    static isString(item) {
        return typeof item === 'string' || item instanceof String;
    }

    /**
     * Returns a buffer from a file.
     * @static
     * @public
     * @param {(String|Buffer)} file - File to buffer.
     * @returns {Object} Buffered file.
     */
    static fileToBuffer(file) {
        file = PdfTk.isString(file) ? fs.readFileSync(file) : file;
        return file;
    }

    /**
     * Returns a buffer from a string.
     * @static
     * @public
     * @param {(String|Buffer)} str - String to buffer.
     * @returns {Object} Buffered string.
     */
    static stringToBuffer(str, encoding = 'utf8') {
        if (Buffer.from) {
            return Buffer.from(str, encoding);
        }
        return new Buffer(str, encoding);
    }

    /**
     * Creates fdf file from JSON input.
     * Converts input values to binary buffer, which seems to allow PdfTk to render utf-8 characters.
     * @static
     * @public
     * @param {Object} data - JSON data to transform to fdf.
     * @returns {Buffer} Fdf data as a buffer.
     */
    static generateFdfFromJSON(data) {

        const header = PdfTk.stringToBuffer(`
            %FDF-1.2\n
            ${String.fromCharCode(226) + String.fromCharCode(227) + String.fromCharCode(207) + String.fromCharCode(211)}\n
            1 0 obj\n
            <<\n
            /FDF\n
            <<\n
            /Fields [\n
        `);

        let body = PdfTk.stringToBuffer('');

        for (const prop in data) {
            /* istanbul ignore else  */
            if (data.hasOwnProperty(prop)) {
                body = Buffer.concat([
                    body,
                    PdfTk.stringToBuffer('<<\n/T ('),
                ]);
                body = Buffer.concat([
                    body,
                    PdfTk.stringToBuffer(prop.toString(), 'binary'),
                ]);
                body = Buffer.concat([
                    body,
                    PdfTk.stringToBuffer(')\n/V('),
                ]);
                body = Buffer.concat([
                    body,
                    PdfTk.stringToBuffer(data[prop].toString(), 'binary'),
                ]);
                body = Buffer.concat([
                    body,
                    PdfTk.stringToBuffer(')\n>>\n'),
                ]);
            }
        }

        const footer = PdfTk.stringToBuffer(`
            ]\n
            >>\n
            >>\n
            endobj \n
            trailer\n
            \n
            <<\n
            /Root 1 0 R\n
            >>\n
            %%EOF\n
        `);

        return Buffer.concat([
            header,
            body,
            footer,
        ]);

    }

    /**
     * Takes a pdftk info string and turns it into an object.
     * @static
     * @public
     * @param {string} data
     * @returns {Object} Key value pairs and arrays of info data.
     */
    static infoStringToObject(data) {
        if (!data || !PdfTk.isString(data)) return null;
        const KEY_DIVIDER = 'Begin';
        const singleLines = data.split('\n');
        let curKey = null;
        const serialised = singleLines.reduce((acc, row) => {
            const splitRow = row.split(KEY_DIVIDER);
            //key could be Info, or Bookmark, or PageMedia, etc.
            const key = splitRow[0];
            //Key with -Begin- has encountered
            if (row.indexOf(KEY_DIVIDER) > -1) {
                //create a new index of data key if it does not exist yet
                if (!acc.hasOwnProperty(key)) {
                    curKey = key;
                    acc[key] = [];
                }
                //a new row with 'Begin' always warants a new object to hold its values
                acc[key].push({});
                //and then return, as we don't add new entries at this point
                return acc;
            }
            const container = acc[curKey];
            const currentEntry = container[container.length - 1];
            //contains the row minus the main key
            const valueContainer = row.substring(curKey.length);

            //check if current value is part of a parent key or a simple key value pair
            if (valueContainer && row.substring(0, curKey.length) === curKey) {
                const valueKey = valueContainer.split(':');
                const key = valueKey.shift(); // valueKey[0] is always key
                let value = valueKey.shift(); // valueKey[1] is always value
                if (valueKey.length) {
                    //if value contains ':' it got split as well, join remainder
                    value = `${value}:${valueKey.join(':')}`;
                }
                currentEntry[key] = value.trim();
            } else {
                //item is not on key, and should just be added as is
                const splitColon = row.split(':');
                if (splitColon[1]) {
                    acc[splitColon[0]] = splitColon[1].trim();
                }
            }

            return acc;
        }, {});

        return serialised;
    }
    /**
     * Creates a pdftk info string value from an object.
     *
     * @static
     * @public
     * @param {Object} data
     * @returns {String} Concatenated string value which can be passed to pdftk
     */
    static infoObjectToString(data) {
        if (!data || !PdfTk.isObject(data)) return null;
        return Object.keys(data)
            .reduce((acc, key) => {
                const val = data[key];
                //if value is array, split it and create a
                //new string row with [key]Begin (BookmarkBegin,InfoBegin, etc.)
                if (Array.isArray(val)) {
                    const vals = val.reduce((acc, item) => {
                        const innerValues = Object.keys(item).reduce(
                            (innerAcc, innerKey, innerIndex) => {
                                if (innerIndex === 0) {
                                    innerAcc = `${innerAcc}\n${key}Begin`;
                                }
                                innerAcc = `${innerAcc}\n${key}${innerKey}: ${
                                    item[innerKey]
                                }`;
                                return innerAcc;
                            },
                            ''
                        );

                        return `${acc}${innerValues}`;
                    }, '');
                    return `${acc}${vals}`;
                }
                // if not an array, take as is and add to accumulator with newline
                // for instance; `NumberOfPages: 6`
                return `${acc}\n${key}: ${val}`;
            }, '')
            .trim();
    }

    /**
     * Creates pdf info text file from JSON input.
     * @static
     * @public
     * @param {Object} data - JSON data to transform to info file.
     * @returns {Buffer} Info text file as a buffer.
     */
    static generateInfoFromJSON(data) {
        return PdfTk.stringToBuffer(PdfTk.infoObjectToString(data));
    }

    /**
     * Creates an input command that uses the stdin.
     * @private
     * @param {String} command - Command to create.
     * @param {(String|Buffer)} file - Stdin file.
     */
    _commandWithStdin(command, file) {
        this.stdin = PdfTk.fileToBuffer(file);
        this.args.push(
            command,
            '-'
        );
    }

    /**
     * Clean up temp files, if created.
     * @private
     */
    _cleanUpTempFiles() {
        while (this.tmpFiles.length > 0) {
            try {
                fs.unlinkSync(this.tmpFiles.pop());
            } catch (err) {
                /* keep going */
            }
        }
    }

    /**
     * Run the command.
     * @public
     * @param {String} writeFile - Path to the output file to write from stdout. If used with the "outputDest" parameter, two files will be written.
     * @param {String} [outputDest] - The output file to write without stdout. When present, the returning promise will not contain the output buffer. If used with the "writeFile" parameter, two files will be written.
     * @param {Boolean} [needsOutput=true] - Optional boolean used to exclude the 'output' argument (only used for specific methods).
     * @returns {Promise} Promise that resolves the output buffer, if "outputDest" is not given.
     */
    output(writeFile, outputDest, needsOutput = true) {
        return new this._Promise((resolve, reject) => {

            if (this.error) {
                this._cleanUpTempFiles();
                return reject(this.error);
            }

            try {
                if (needsOutput) {
                    this.args.push(
                        'output',
                        outputDest || '-'
                    );
                }

                this.args = this.args.concat(this.postArgs);

                const child = spawn(this._bin, this.args);

                const result = [];

                child.stderr.on('data', data => {
                    if (!(this._ignoreWarnings && data.toString().toLowerCase().includes('error'))) {
                        this._cleanUpTempFiles();
                        return reject(data.toString('utf8'));
                    }
                });

                child.on('error', e => {
                    this._cleanUpTempFiles();
                    if (e.code === 'ENOENT') {
                        return reject(new Error(`
                        pdftk was called but is not installed on your system.
                        Install it here: https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/
                    `));
                    }
                    return reject(e);
                });

                child.stdout.on('data', data => result.push(PdfTk.stringToBuffer(data)));

                child.on('close', code => {

                    this._cleanUpTempFiles();

                    if (code === 0) {
                        const output = Buffer.concat(result);
                        if (writeFile) {
                            return fs.writeFile(writeFile, output, err => {
                                if (err) return reject(err);
                                return resolve(output);
                            });
                        }
                        return resolve(output);
                    }
                    return reject(code);
                });

                if (this.stdin) {
                    child.stdin.write(this.stdin);
                    child.stdin.end();
                }
            } catch (err) {
                this._cleanUpTempFiles();
                return reject(err);
            }

        });
    }

    /**
     * Assembles ("concatenate") pages from input PDFs to create a new PDF.
     * @public
     * @chainable
     * @param {(String|Array)} [catCommand] - Page ranges for cat method.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-cat}
     */
    cat(catCommand) {
        if (this.error) return this;
        try {
            this.args.push('cat');
            if (catCommand) {
                catCommand = Array.isArray(catCommand) ? catCommand : catCommand.split(' ');
                for (const cmd of catCommand) {
                    this.args.push(cmd);
                }
            }
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Collates pages from input PDF to create new PDF.
     * @public
     * @chainable
     * @param {(String|Array)} [shuffleCommand] - Page ranges for shuffle method.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-shuffle}
     */
    shuffle(shuffleCommand) {
        if (this.error) return this;
        try {
            this.args.push('shuffle');
            if (shuffleCommand) {
                shuffleCommand = Array.isArray(shuffleCommand) ? shuffleCommand : shuffleCommand.split(' ');
                for (const cmd of shuffleCommand) {
                    this.args.push(cmd);
                }
            }
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Splits a single PDF into individual pages.
     * @public
     * @param {String} [outputOptions] - Burst output options for naming conventions.
     * @returns {Promise}
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-burst}
     */
    burst(outputOptions) {
        if (this.error) return this;
        const hasOutput = !!outputOptions;
        try {
            this.args.push('burst');
        } catch (err) {
            this.error = err;
        }
        return this.output(null, (outputOptions || null), hasOutput);
    }

    /**
     * Takes a single input PDF and rotates just the specified pages.
     * @public
     * @chainable
     * @param {(String|Array)} rotateCommand - Page ranges for rotate command.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-rotate}
     */
    rotate(rotateCommand) {
        if (this.error) return this;
        try {
            this.args.push('rotate');
            if (rotateCommand) {
                rotateCommand = Array.isArray(rotateCommand) ? rotateCommand : rotateCommand.split(' ');
                for (const cmd of rotateCommand) {
                    this.args.push(cmd);
                }
            }
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Generate fdf file from input PDF.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-generate-fdf}
     */
    generateFdf() {
        if (this.error) return this;
        try {
            this.args.push('generate_fdf');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Fill a PDF form from JSON data.
     * @public
     * @chainable
     * @param {Object} data - Form fill data.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-fill-form}
     */
    fillForm(data) {
        if (this.error) return this;
        try {
            data = PdfTk.isString(data) ? data : PdfTk.generateFdfFromJSON(data);
            this._commandWithStdin('fill_form', data);
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Applies a PDF watermark to the background of a single PDF.
     * @public
     * @chainable
     * @param {(String|Buffer)} file - PDF file that contains the background to be applied.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-background}
     */
    background(file) {
        if (this.error) return this;
        try {
            this._commandWithStdin('background', file);
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Same as the background operation, but applies each page of the background PDF to the corresponding page of the input PDF.
     * @public
     * @chainable
     * @param {(String|Buffer)} file - PDF file that contains the background to be applied.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-multibackground}
     */
    multiBackground(file) {
        if (this.error) return this;
        try {
            this._commandWithStdin('multibackground', file);
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * This behaves just like the background operation except it overlays the stamp PDF page on top of the input PDF document’s pages.
     * @public
     * @chainable
     * @param {(String|Buffer)} file - PDF file that contains the content to be stamped.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-stamp}
     */
    stamp(file) {
        if (this.error) return this;
        try {
            this._commandWithStdin('stamp', file);
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Same as the stamp operation, but applies each page of the stamp PDF to the corresponding page of the input PDF.
     * @public
     * @chainable
     * @param {(String|Buffer)} file - PDF file that contains the content to be stamped.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-multistamp}
     */
    multiStamp(file) {
        if (this.error) return this;
        try {
            this._commandWithStdin('multistamp', file);
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Outputs PDF bookmarks and metadata.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-dump-data}
     */
    dumpData() {
        if (this.error) return this;
        try {
            this.args.push('dump_data');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Outputs PDF bookmarks and metadata with utf-8 encoding.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-dump-data-utf8}
     */
    dumpDataUtf8() {
        if (this.error) return this;
        try {
            this.args.push('dump_data_utf8');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Outputs form field statistics.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-dump-data-fields}
     */
    dumpDataFields() {
        if (this.error) return this;
        try {
            this.args.push('dump_data_fields');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Outputs form field statistics with utf-8 encoding.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-dump-data-fields-utf8}
     */
    dumpDataFieldsUtf8() {
        if (this.error) return this;
        try {
            this.args.push('dump_data_fields_utf8');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Outputs PDF annotation information.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-dump-data-annots}
     */
    dumpDataAnnots() {
        if (this.error) return this;
        try {
            this.args.push('dump_data_annots');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Update the bookmarks and metadata of a PDF with utf-8 encoding.
     * @public
     * @chainable
     * @param {Object} data - Update data.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-update-info}
     */
    updateInfo(data) {
        if (this.error) return this;
        try {
            data = PdfTk.isString(data) ? data : PdfTk.generateInfoFromJSON(data);
            this._commandWithStdin('update_info', data);
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Update the bookmarks and metadata of a PDF.
     * @public
     * @chainable
     * @param {Object} data - Update data.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-update-info-utf8}
     */
    updateInfoUtf8(data) {
        if (this.error) return this;
        try {
            data = PdfTk.isString(data) ? data : PdfTk.generateInfoFromJSON(data);
            this._commandWithStdin('update_info_utf8', data);
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Attach files to PDF.
     * @public
     * @chainable
     * @param {(String|String[])} files - Files to attach.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-attach} for more information.
     */
    attachFiles(files) {
        if (this.error) return this;
        try {
            files = Array.isArray(files) ? files : [
                files,
            ];

            this.args.push('attach_files');

            for (const file of files) {
                this.args.push(file);
            }
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Unpack files into an output directory. This method is not chainable, and hereby does not require
     * the output method afterwards.
     * @public
     * @param {String} outputDir - Output directory for files.
     * @returns {Promise}
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-unpack} for more information.
     */
    unpackFiles(outputDir) {
        if (this.error) return this;
        try {
            this.args.push('unpack_files');
        } catch (err) {
            this.error = err;
        }
        return this.output(null, outputDir);
    }

    /**
     * Used with the {@link attachFiles} method to attach to a specific page.
     * @public
     * @chainable
     * @param {Number} pageNo - Page number in which to attach.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-op-attach}
     */
    toPage(pageNo) {
        if (this.error) return this;
        try {
            this.args.push(
                'to_page',
                pageNo
            );
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Merge PDF form fields and their data.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-output-flatten}
     */
    flatten() {
        if (this.error) return this;
        try {
            this.postArgs.push('flatten');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Set Adobe Reader to generate new field appearances.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-output-need-appearances}
     */
    needAppearances() {
        if (this.error) return this;
        try {
            this.postArgs.push('need_appearances');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Restore page sream compression.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-compress}
     */
    compress() {
        if (this.error) return this;
        try {
            this.postArgs.push('compress');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Remove page stream compression.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-compress}
     */
    uncompress() {
        if (this.error) return this;
        try {
            this.postArgs.push('uncompress');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Keep first ID when combining files.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-keep-id}
     */
    keepFirstId() {
        if (this.error) return this;
        try {
            this.postArgs.push('keep_first_id');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Keep final ID when combining pages.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-keep-id}
     */
    keepFinalId() {
        if (this.error) return this;
        try {
            this.postArgs.push('keep_final_id');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Drop all XFA data.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-drop-xfa}
     */
    dropXfa() {
        if (this.error) return this;
        try {
            this.postArgs.push('drop_xfa');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Set the verbose option.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-verbose}
     */
    verbose() {
        if (this.error) return this;
        try {
            this.postArgs.push('verbose');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Never prompt when errors occur.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-ask}
     */
    dontAsk() {
        if (this.error) return this;
        try {
            this.postArgs.push('dont_ask');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Always prompt when errors occur.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-ask}
     */
    doAsk() {
        if (this.error) return this;
        try {
            this.postArgs.push('do_ask');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Set the input password.
     * @public
     * @chainable
     * @param {String} password - Password to set.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-input-pw}
     */
    inputPw(password) {
        if (this.error) return this;
        try {
            this.args.push(
                'input_pw',
                password
            );
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Set the user password.
     * @public
     * @chainable
     * @param {String} password - Password to set.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-output-enc-user-pw}
     */
    userPw(password) {
        if (this.error) return this;
        try {
            this.postArgs.push(
                'user_pw',
                password
            );
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Set the owner password.
     * @public
     * @chainable
     * @param {String} password - Password to set.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-output-enc-owner-pw}
     */
    ownerPw(password) {
        if (this.error) return this;
        try {
            this.postArgs.push(
                'owner_pw',
                password
            );
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Set permissions for a PDF. By not passing in the "perms" parameter, you are disabling all features.
     * @public
     * @chainable
     * @param {(String|String[])} [perms] - Permissions to set. Choices are: Printing, DegradedPrinting, ModifyContents,
     * Assembly, CopyContents, ScreenReaders, ModifyAnnotations, FillIn, AllFeatures. Passing no arguments will disable all.
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-output-enc-perms}
     */
    allow(perms) {
        if (this.error) return this;
        try {
            this.postArgs.push('allow');
            if (perms) {
                perms = Array.isArray(perms) ? perms.join(' ') : perms;
                this.postArgs.push(perms);
            }
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Set 40 bit encryption.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-output-enc-strength}
     */
    encrypt40Bit() {
        if (this.error) return this;
        try {
            this.postArgs.push('encrypt_40bit');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Set 128 bit encryption.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     * @see {@link https://www.pdflabs.com/docs/pdftk-man-page/#dest-output-enc-strength}
     */
    encrypt128Bit() {
        if (this.error) return this;
        try {
            this.postArgs.push('encrypt_128bit');
        } catch (err) {
            this.error = err;
        }
        return this;
    }

    /**
     * Allows the plugin to ignore the PDFTK warnings. Useful with huge PDF files.
     * @public
     * @chainable
     * @returns {Object} PdfTk class instance.
     */
    ignoreWarnings() {
        if (this.error) return this;
        try {
            this._ignoreWarnings = true;
        } catch (err) {
            this.error = err;
        }
        return this;
    }
}

// module.exports = PdfTk;

module.exports = {
    PdfTk,
    input: file => new PdfTk(file),
    configure: options => {
        Object.defineProperties(PdfTk.prototype, {
            _Promise: {
                value: options.Promise,
                writable: true,
            },
            _bin: {
                value: options.bin,
                writable: true,
            },
            _ignoreWarnings: {
                value: options.ignoreWarnings,
                writable: true,
            },
            _tempDir: {
                value: options.tempDir,
                writable: true,
            },
        });
    },
};
