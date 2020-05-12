const path = require('path');
const fs = require('fs');

const amf = require('amf-client-js');

const AMF_RESOURCE_PREFIX = 'file://';

function ramlResourceToPath(resource) {
    return resource.replace(AMF_RESOURCE_PREFIX, '/');
}

function pathToRamlResource(filePath) {
    const absPath = filePath.startsWith('/')
        ? filePath
        : path.resolve(filePath);
    return AMF_RESOURCE_PREFIX + absPath.substring(1);
}

const RAML_LOADER = {
    accepts(resource) {
        return (
            resource.startsWith(AMF_RESOURCE_PREFIX) &&
            fs.existsSync(ramlResourceToPath(resource))
        );
    },
    fetch(resource) {
        let source,
            targetResource = resource;

        if (targetResource.startsWith(AMF_RESOURCE_PREFIX)) {
            const resourcePath = ramlResourceToPath(targetResource);
            source = fs.readFileSync(resourcePath, 'utf-8');
        }

        const content = new amf.client.remote.Content(source, targetResource);
        return Promise.resolve(content);
    }
};

async function validate(path) {
    // init
    amf.plugins.document.WebApi.register();
    amf.plugins.document.Vocabularies.register();
    amf.plugins.features.AMFValidation.register();
    await amf.AMF.init();

    // parse
    const environment = new amf.client.environment.Environment().addClientLoader(
        RAML_LOADER
    );
    const parser = new amf.Raml10Parser(environment);
    const model = await parser.parseFileAsync(pathToRamlResource(path));

    // validate with RAML validator
    const { results: ramlValidationResults } = await amf.AMF.validate(
        model,
        amf.ProfileNames.RAML,
        amf.MessageStyles.RAML
    );

    const ramlViolations = ramlValidationResults
        .filter((result) => result.level === 'Violation')
        .map((violation) => {
            const { message, validationId } = violation;
            return `validationId: ${validationId} ::: message: ${message}`;
        });

    console.log(
        `Found ${
            ramlViolations.length
        } violation(s) from raml validator:\n${ramlViolations.join('\n')}`
    );
}

const overlayPath = path.resolve(__dirname, 'overlay.raml');

validate(overlayPath).then(() => {
    console.log('Complete');
});
