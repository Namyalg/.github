const Ajv = require('ajv');
const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs').promises;

function getFileExtension(filename){
    return filename.split('.').pop();
}

async function validateYmlSchema(filename){
    const fileExtensions = ["yml", "yaml"];
    if(fileExtensions.includes(getFileExtension(filename)){
        console.log("File name " + filename);
        const schema = await axios.get(
        'https://json.schemastore.org/github-workflow.json'
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
        }
    }
}

var arguments = process.argv;
validateYmlSchema(arguments[2]);
