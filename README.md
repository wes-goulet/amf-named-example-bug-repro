# amf-named-example-bug-repro

This repo reproduces [an issue in AMF-client-js](https://github.com/aml-org/amf/issues/589) where defining a named example in an overlay RAML fails AMF validation.

[Docs on AMF Validation](https://github.com/mulesoft-labs/amf-validation-example/blob/master/documentation/validation.md)

## To Run

`npm start`

The current output will look like:

```sh
$ npm start

> amf-named-example-bug-repro@1.0.0 start /Users/wpeter/Source/Repos/amf-named-example-bug-repro
> node index.js

Found 1 violation(s) from raml validator:
validationId: http://a.ml/vocabularies/amf/validation#example-validation-error ::: message: should be object
Complete
```

## To Debug

Use the checked-in vscode debug profile (just hit F5 in vscode). Or `node --inspect-brk index.js` and attach.
