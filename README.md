# node-pdftk #

[![NPM](https://nodei.co/npm/node-pdftk.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/node-pdftk/)

A wrapper for [PDFtk](https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/) with streams and promises. All methods included.

> **2.0 Note** - If you are planning on upgrading from version 1, you shouldn't have any problems unless you are subclassing the PdfTk class - it is no longer being directly exposed. All methods should behave the same as before.

## Requirements ##

Make sure you have [PDFtk](https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/) installed and in your system path (or configure the plugin to point to your binary file - see options below).

> **Mac users** - Be aware of [this PDFTk issue](https://github.com/jjwilly16/node-pdftk/issues/3)

## Installation ##

```cmd
npm install node-pdftk
```

```javascript
const pdftk = require('node-pdftk');
```

## Usage ##

#### Fill a form ####

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

#### Concatenate pages ####

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

#### Stamp page ####

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

## Options ##

Options can be configured with the **configure** method. These options will be inherited by all instances.

```javascript
const pdftk = require('node-pdftk');

pdftk.configure({
    bin: '/your/path/to/pdftk/bin',
    Promise: require('bluebird'),
    ignoreWarnings: true,
    tempDir: path.join(__dirname, './your/custom/temp/dir')
});
```

---
Name | Description | Type | Default Value
--- | --- | --- | ---
bin | Path to your PdfTk executable | String | 'pdftk'
Promise | Promise library to implement | Object | Promise
ignoreWarnings | Ignore PdfTk warnings. Useful with huge PDF files | Boolean | False
tempDir | Changes the directory where temporary files are stored. MUST BE ABSOLUTE PATH. Use the [path](https://nodejs.org/docs/latest/api/path.html) module. | String | libPath + './node-pdftk-tmp/')

## Configuring your PdfTk path ##

If you need to configure a path to your PdfTk executable, you have a couple of options:

1. Set the **bin** option with the **configure** method (see the **options** section above).
2. Set an environmental variable named **PDFTK_PATH**.

The **bin** option takes precedence over everything, followed by the environmental variable, and will fall back to 'pdftk' if those are not set.

## How it works ##

All instances must begin with the **.input** method and end with the **.output** method.

The **.input** method will accept a buffer, file path, or an array of buffer/file paths. It will then initialize the input of the command.

Any method called after input will simply add on commands. There is a certain amount of responsibility in the user's hands to make sure the commands will work properly in the order you call them. For example, you cannot call *.fillForm().stamp()*. Read the [PDFtk docs](https://www.pdflabs.com/docs/pdftk-man-page/) to learn more.

The **.output** method simply executes the command and returns a promise that resolves the stdout as a buffer (you can also write to disk as well with a file path argument).

- **Note:** - The output method is not needed for all methods (e.g. burst, unpackFiles) - it is internally called with those.

## More Examples ##

#### Express example - render directly in browser ####

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

#### Input a buffer, output a file and a buffer ####

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

#### Useful chaining ####

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

> The tests are a work in progress (feel free to submit pull requests)

Because of the small differences with pdfs being generated across OS platforms, a lot of the test files are generated in the npm 'pretest' script with pdftk. If you have some sort of special setup where your pdftk path is not standard, you will want to edit that script in [pretest.js](./pretest.js) (it does check for the **PDFTK_PATH** environmental variable, though).

Run tests with:

```bash
npm install && npm test
```

Test coverage with:

```bash
npm run coverage
```

## Contributing ##

If you feel the library could be improved in any way, feel free to submit a pull request. I'm pretty laid back so I don't expect much, but all I ask is that you run the tests to make sure everything is kosher (my eslint rules may bite you in the ass there).

Please keep in mind that this library is just a wrapper for something else, so try to avoid extending the functionality beyond what it is intended to do.
