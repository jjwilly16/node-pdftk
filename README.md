# node-pdftk #

[![NPM](https://nodei.co/npm/node-pdftk.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/node-pdftk/)

A wrapper for [PDFtk](https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/) with streams and promises. All methods included.

## Requirements ##

Make sure you have [PDFtk](https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/) installed and in your system path.

> **Mac users** - Be aware of [this PDFTk issue](https://github.com/jjwilly16/node-pdftk/issues/3)

## Installation ##

```cmd
npm install node-pdftk
```

```javascript
const pdftk = require('node-pdftk');
```

## Usage ##

> Fill a form

```javascript
pdftk
    .input('./myfile.pdf')
    .fillForm({
        some: 'data',
        to: 'fill',
        the: 'form',
    })
    .flatten()
    .output()
    .then(buffer => {
        // Do stuff with the output buffer
    })
    .catch(err => {
        // handle errors
    });
```

> Catenate pages

```javascript
pdftk
    .input({
        A: './page1.pdf',
        B: fs.readFileSync('./page2.pdf'),
    })
    .cat('A B')
    .output('./2pagefile.pdf')
    .then(buffer => {
        // Do stuff with the output buffer
    })
    .catch(err => {
        // handle errors
    });
```

> Stamp page

```javascript
pdftk
    .input('./iNeedALogo.pdf')
    .stamp('./logo.pdf')
    .output()
    .then(buffer => {
        // Do stuff with the output buffer
    })
    .catch(err => {
        // handle errors
    });
```

## How it works ##

All instances must begin with the **.input** method and end with the **.output** method.

The **.input** method will accept a buffer, file path, or an array of buffer/file paths. It will then initialize the input of the command.

Any method called after input will simply add on commands. There is a certain amount of responsibility in the user's hands to make sure the commands will work properly in the order you call them. For example, you cannot call *.fillForm().stamp()*. Read the [PDFtk docs](https://www.pdflabs.com/docs/pdftk-man-page/) to learn more.

The **.output** method simply executes the command and spits out the stdout either as a buffer or to a file.

- **Note:** - The output method is not needed for all methods (e.g. burst, unpackFiles)

## More Examples ##

> Express example - render directly in browser

```javascript
app.get('./file.pdf', (req, res, next) => {
    pdftk
        .input('./file.pdf')
        .fillForm(formdata)
        .flatten()
        .output()
        .then(buf => {
            res.type('application/pdf'); // If you omit this line, file will download
            res.send(buf);
        })
        .catch(next);
});
```

> Input a buffer, output a file and a buffer

```javascript
pdftk
    .input(fs.readFileSync('./file.pdf'))
    .output('./path/to/output.pdf')
    .then(buffer => {
        // Still returns a buffer
    })
    .catch(err => {
        // handle errors
    });
```

> Useful chaining

```javascript
pdftk
    .input('./form.pdf')
    .fillForm(myFormData)
    .flatten()
    .output()
    .then(buffer => {
        return pdftk
            .input(buffer)
            .stamp('./logo.pdf')
            .output()
    })
    .then(buffer => {
        // Do stuff with buffer
    })
    .catch(err => {
        // handle errors
    });
```

## Testing ##

> The tests are a work in progress

Because of the small differences with pdfs being generated across OS platforms, some of the test files are generated in the npm 'pretest' script with pdftk. If you have some sort of special setup where your pdftk path is not standard, you will want to edit that script in package.json.

Run tests with:

```bash
npm install && npm test
```

Test coverage with:

```bash
npm run test-coverage
```
