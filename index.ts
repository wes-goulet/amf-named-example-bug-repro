import path from 'path';
import fs from 'fs';

import * as amf from 'amf-client-js';

export const AMF_RESOURCE_PREFIX = 'file://';

const CUSTOM_VALIDATIONS_PATH = path.resolve(
    __dirname,
    'custom-validations.raml'
);

export function ramlResourceToPath(resource: string): string {
    return resource.replace(AMF_RESOURCE_PREFIX, '/');
}

export function pathToRamlResource(filePath: string) {
    const absPath = filePath.startsWith('/')
        ? filePath
        : path.resolve(filePath);
    return AMF_RESOURCE_PREFIX + absPath.substring(1);
}

const RAML_LOADER: amf.resource.ResourceLoader = {
    accepts(resource: string) {
        return (
            resource.startsWith(AMF_RESOURCE_PREFIX) &&
            fs.existsSync(ramlResourceToPath(resource))
        );
    },
    fetch(resource: string) {
        let source: string,
            targetResource: string = resource;

        if (targetResource.startsWith(AMF_RESOURCE_PREFIX)) {
            const resourcePath = ramlResourceToPath(targetResource);
            source = fs.readFileSync(resourcePath, 'utf-8');
        }

        const content = new amf.client.remote.Content(source!, targetResource);
        return Promise.resolve(content);
    }
};

async function init(): Promise<void> {
    amf.plugins.document.WebApi.register();
    amf.plugins.document.Vocabularies.register();
    amf.plugins.features.AMFValidation.register();

    // Initialize the AMF library
    await amf.AMF.init();
}

async function parse(path) {
    await init();

    const environment = new amf.client.environment.Environment().addClientLoader(
        RAML_LOADER
    );
    const parser = new amf.Raml10Parser(environment);

    return parser.parseFileAsync(pathToRamlResource(path));
}

async function validate(path) {
    const model = await parse(path);
    const profileName = await amf.Core.loadValidationProfile(
        `file://${CUSTOM_VALIDATIONS_PATH}`
    );
    const { results } = await amf.AMF.validate(
        model,
        profileName,
        amf.MessageStyles.RAML
    );

    results
        .filter((result) => result.level === 'Violation')
        .map((violation) => {
            const { targetNode, position, message, validationId } = violation;

            console.error(`validation error: ${message}`);
        });
}

const overlayPath = path.resolve(__dirname, 'overlay.raml');

validate(overlayPath).then(() => {
    console.log('Complete');
});
