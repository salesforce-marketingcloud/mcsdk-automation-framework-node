const fs = require('fs');
const path = require('path');

(() => {
    (() => {
        if(process.argv.length < 3){
            throw new Error('The script is expecting the full path to the folder containing the generated Api classes as argument');
        }
        const apiClassesFolderPath = process.argv[2];
        const indentation = '\n\t    ';
        const fileExtension = '.js';

        let propertiesBlock = '';
        let gettersBlock = '';
        let getterTemplateContent = readFile('./getterTemplate.txt');
        let clientTemplateContent = readFile('./clientTemplate.txt');
        let apiClassesNames = getGeneratedApiClassesNames(apiClassesFolderPath);

        apiClassesNames.forEach(apiClass => {
            let propertyName = apiClass.replace(apiClass[0], apiClass[0].toLowerCase());
            propertyName = propertyName.slice(0, -(fileExtension.length));
            propertiesBlock += `this._${propertyName} = undefined;${indentation}`;

            gettersBlock += `\n\t${getterTemplateContent}`;
            gettersBlock = gettersBlock.replace(/<<getterName>>/g, propertyName);

            propertyName = propertyName.replace(propertyName[0], propertyName[0].toUpperCase());
            gettersBlock = gettersBlock.replace('<<apiName>>', propertyName);
        });
        propertiesBlock = propertiesBlock.slice(0, -(indentation.length));

        clientTemplateContent = clientTemplateContent.replace('<<apiPropertyInitialization>>', propertiesBlock);
        clientTemplateContent = clientTemplateContent.replace('<<apiGetter>>', gettersBlock);

        let clientClassPath = path.join(apiClassesFolderPath, 'Client.js');
        writeFile(clientClassPath, clientTemplateContent);
    })();

    // Helpers:

    function readFile(filePath) {
        return fs.readFileSync(filePath, 'utf8');
    }
    function writeFile(folderPath, data){
        fs.writeFileSync(folderPath, data);
    }
    function getGeneratedApiClassesNames(folderPath) {
        let apiClasses = [];

        fs.readdirSync(folderPath).forEach(fileName => {
            if (fileName.endsWith('Api.js') && fileName !== 'BaseApi.js') {
                apiClasses.push(fileName);
            }
        });
        return apiClasses;
    }
})();