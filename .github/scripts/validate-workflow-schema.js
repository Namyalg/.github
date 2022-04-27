const core = require('@actions/core');
const Ajv = require('ajv');
const axios = require('axios');
const yaml = require('js-yaml');
const fs = require('fs');


function getFileExtension(filename){
    return filename.split('.').pop();
}

function validateYmlSchema(filename){
    const fileExtensions = ['yml', 'yaml'];
    if(fileExtensions.includes(getFileExtension(filename))){
        let schema = fs.readFileSync('.github/scripts/check.json', {encoding:'utf8', flag:'r'});
        schema = JSON.parse(schema);
        const file = fs.readFileSync(filename, 'utf8');
        try{
            const target = yaml.load(file);
            const ajv = new Ajv({ strict: false, allErrors: true });
            const validator = ajv.compile(schema);
            const valid = validator(target);
            if (!valid) {
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
    const allLogs = {}
    try{
        arrayFiles = files.split(" ");
    }
    catch(e){
        arrayFiles = files
    }
    for(file of arrayFiles){
        console.log("ERROR IN FILE " + file)
        let log = validateYmlSchema(file);
        if(log['status'] == false){
            allLogs[file] = log['log']
        }
    }
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

