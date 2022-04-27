const core = require('@actions/core');
const Ajv = require('ajv');
const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs').promises;

function getFileExtension(filename){
    return filename.split('.').pop();
}

async function validateYmlSchema(filename){
    const fileExtensions = ['yml', 'yaml'];
    if(fileExtensions.includes(getFileExtension(filename))){
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
                console.log("The workflow in " + filename + " adheres to the schema");
            }
        }
        catch(err){
            console.log("The workflow in " + filename + " has an invalid schema");
            console.log(err);
            //core.error(`Action failed with error ${err}`);
        }
    } else {
        console.log("It is not a yml file");
    }
}

module.exports = (files) => {
    console.log("In the script")
    let arrayFiles = {};
    try{
        arrayFiles = files.split(" ");
    }
    catch(e){
        arrayFiles = files
    }
    
    for(file of arrayFiles){
        validateYmlSchema(file);
    }
}


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


