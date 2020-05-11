# amf-named-example-bug-repro

This repo attempts to reproduce an issue where defining a named example in an overlay RAML fails validation when using a custom validation profile.

[Docs on AMF Validation](https://github.com/mulesoft-labs/amf-validation-example/blob/master/documentation/validation.md)

## To Run

`npm start`

The current output will look like:

```sh
$ npm start

> amf-named-example-bug-repro@1.0.0 start /Users/wpeter/Source/Repos/amf-named-example-bug-repro
> node index.js

Found 1 violation(s) from custom validator:
validationId: http://a.ml/vocabularies/amf/validation#example-validation-error ::: message: should be object


Found 0 violation(s) from raml validator:

Complete
```

## To Debug

Use the checked-in vscode debug profile (just hit F5 in vscode). Or `node --inspect-brk index.js` and attach.
