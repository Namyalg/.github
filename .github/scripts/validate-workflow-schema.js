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
        const schema = axios.get(
        'https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/github-workflow.json'
        );
        const file = await fs.readFile(filename, 'utf8');
        try{
            const target = yaml.load(file);
            const ajv = await new Ajv({ strict: false, allErrors: true });
            const validator = ajv.compile(schema.data);
            const valid = validator(target);
            if (!valid) {
                console.log("In validator ");
                console.log(validator.errors)
                return {
                    'status' : false,
                    'log': validator.errors
                }          
            } else {
                return {
                    'status' : true,
                    'log': "Validation successful"
                }
            }
        }
        catch(err){
            console.log("In validator ");
            console.log(err)
            return {
                'status' : false,
                'log': err
            }
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
        if(log['status'] == false){
            console.log("here")
            allLogs[file] = log['log']
        }
    }
    
    console.log("All logs are");
    console.log(allLogs);
    console.log(Object.keys(allLogs).length)

    if(Object.keys(allLogs).length > 0){
        
    
        for(f in allLogs){
            console.log(f);
            console.log(allLogs[f]);
        }
        core.setFailed(`There are errors in the workflow files`);
    } else {
        console.log("No errors detected in the yml/yaml files");
    }
}

