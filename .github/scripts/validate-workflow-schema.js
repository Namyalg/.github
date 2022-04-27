const core = require('@actions/core');
const Ajv = require('ajv');
const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs').promises;

function getFileExtension(filename){
    return filename.split('.').pop();
}

async function validateYmlSchema(filename){
    if(getFileExtension(filename) === 'yml'){
        const Ajv = require('ajv');
        const axios = require('axios');
        const yaml = require('js-yaml');
        const fs = require('fs').promises;
        console.log("File name " + filename);
        const schema = await axios.get(
        'https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/github-workflow.json'
        );
        const file = await fs.readFile(filename, 'utf8');
        try{
            const target = yaml.load(file);
            const ajv = new Ajv({ strict: false, allErrors: true });
            const validator = ajv.compile(schema.data);
            const valid = validator(target);
            if (!valid) {
                console.error(`Validation failed with the following errors:`);
                console.log(validator.errors)
            } else {
                console.log("The workflow in " + filename + " follows the schema");
            }
        }
        catch(err){
            console.log("The workflow in " + filename + " has an invalid schema");
            console.log(err);
            core.error(`Action failed with error ${err}`);
        }
    }
}

var arguments = process.argv;
validateYmlSchema(arguments[2]);



/*

const core = require('@actions/core');

try {
  // Do stuff
}
catch (err) {
  // setFailed logs the message and sets a failing exit code
  core.setFailed(`Action failed with error ${err}`);
}
*/
