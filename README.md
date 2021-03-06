# Questioner

An extension for [inquirer.js](https://github.com/SBoudrias/Inquirer.js).

## Installation

```
npm install questioner
```

```
var questioner = require("questioner");
questioner.prompt([/* Pass your questions in here */], function( answers ) {
    // Use user feedback for... whatever!!
});
```
* Very similar to the inquirer. See the [inquirer.js](https://github.com/SBoudrias/Inquirer.js) documentation


## The extension

### Subquestions

You can make subquestions for all boolean questions.

```
var questioner = require("questioner");

var questions = [{
    type: 'confirm',
    name: 'mobile',
    message: 'You have an iPhone?',
    subquestions: {
        'true': [{
            type: 'checkbox',
            name: 'mobile.model',
            message: 'Model?',
            choices: ['3', '4', '4s', '5', '5s', '5c', '6', '6 plus']
        }],
        'false': [{
            type: 'input',
            name: 'mobile.model',
            message: 'What is your phone model?'
        }],        
    }    
}];

questioner(questions, function( answers ) {
    // Use user feedback for... whatever!!
});

```

And model question only made if mobile question is true.

### Confirmation

At the end, questioner show answers, and made a confirmation question. If confirm, callback is call. If not, Restart questions with the previous answers filled
