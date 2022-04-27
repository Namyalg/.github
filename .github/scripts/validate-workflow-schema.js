const core = require('@actions/core');
const Ajv = require('ajv');
const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs').promises;
const allLogs = {}

function getFileExtension(filename){
    return filename.split('.').pop();
}

function validateYmlSchema(filename){
    const fileExtensions = ['yml', 'yaml'];
    if(fileExtensions.includes(getFileExtension(filename))){
        console.log("File name " + filename);
        const schema = axios.get(
        'https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/github-workflow.json'
        );
        const file = fs.readFile(filename, 'utf8');
        try{
            console.log("here in the try block");
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
        console.log("file is " + file)
        let log = validateYmlSchema(file);
        if(!log['status']){
            allLogs[file] = log['log']
        }
    }
    
    if(allLogs.length > 0){
        console.log("All logs are");
        console.log(allLogs);
    
        for(f in allLogs){
            console.log(f);
            console.log(allLogs[f]);
        }
        core.error(`There are errors in the workflow files`);
    } else {
        console.log("There are no errors");
    }
}

