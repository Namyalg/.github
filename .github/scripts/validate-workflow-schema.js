const core = require('@actions/core');
const Ajv = require('ajv');
const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs').promises;
const allLogs = {}

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
                return {
                    'status' : false,
                    'log': "Validation successful"
                }          
            } else {
                return {
                    'status' : false,
                    'log': validator.errors
                }
            }
        }
        catch(err){
            return {
                'status' : false,
                'log': err
            }
            //core.error(`Action failed with error ${err}`);
        }
    } else {
        return {
            'status' : true,
            'log': "Not a yml/yaml file"
        }
    }
}

module.exports = (files) => {
    let arrayFiles = {};
    try{
        arrayFiles = files.split(" ");
    }
    catch(e){
        arrayFiles = files
    }
    for(file of arrayFiles){
        let log = validateYmlSchema(file);
        console.log("file log is ")
        console.log(log);
        if(!log['status']){
            allLogs[file] = log['log']
        }
    }
    console.log("All logs are");
    console.log(allLogs);

    for(f in allLogs){
        console.log(f);
        console.log(allLogs[f]);
    }
}

