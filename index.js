'use strict';

// Include Gulp & Tools We'll Use
var inquirer = require('inquirer');

//Slush inquirer
module.exports = function(questions, finalCallback) {

  var questioner = {
    questions: questions,
    answers: {
      old: {},
      running: {}
    },
    queue: [],
    runing: null
  };

  return run();

  //////////////////////////////////////////////////////////////////////////////

  function jsonizer(json, key, value) {
    var levels = (typeof key === 'string') ? key.split('.') : key;
    var level = levels[0];

    levels.shift();

   if (levels.length > 0) {
      var previous = json[level] || {};
      json[level] = jsonizer(previous, levels.join('.'), value);
    } else {
      json[level] = value;
    }

    return json;
  }

  function answersParse(answers) {
    var indexes = {};

    for(var attr in answers) {
      var attrs = attr.split('.');
      var index = attrs[0];
      attrs.shift();

      if (attrs.length) {
        if ( indexes[index] === undefined ) {
          indexes[index] = {};
        }

        indexes[index] = jsonizer(indexes[index], attrs, answers[attr]);
      } else {
        indexes[index] = answers[attr];
      }
    }

    return indexes;
  };

  function questionsParse(questions) {
    var parsed = [];

    questions.forEach(function(question, key){
      parsed[key] = question;

      if (question.validator) {
        question.validate = validator(question.validator);
        parsed[key].validator = undefined;
      }

      var oldAnswer = questioner.answers.old[question.name];
      parsed[key].default = oldAnswer || question.default || undefined;
    });

    return parsed;
  }

  function queueAdd(questions) {
    var total = questions.length - 1;
    questions = questionsParse(questions);

    for (var i = total; i >= 0; i--) {
      questioner.queue.splice(0,0, questions[i]);
    }

  }

  function callback(answers) {
    var key = Object.keys(answers)[0];
    questioner.answers.running[key] = answers[key];

    if (questioner.running.subquestions) {
      if (questioner.running.subquestions['true'] && answers[key]) {
        queueAdd(questioner.running.subquestions['true']);
      } else if (questioner.running.subquestions['false'] && !answers[key]) {
        queueAdd(questioner.running.subquestions['false']);
      }
    }

    next();
  }

  function ask(question, callback) {
    inquirer.prompt([question], callback);
  }

  function looksGood() {
    var answers = answersParse(questioner.answers.running);
    var total = Object.keys(questioner.answers.running).length;

    if (!total) {
      finalCallback(answers);
      return;
    }

    questioner.answers.old = questioner.answers.running;
    questioner.answers.running = {}

    console.log(JSON.stringify(answers, null, '\t'));

    inquirer.prompt([{
      name: 'confirm',
      message: 'Is this OK?',
      type: 'confirm',
      default: true
    }], function (answer) {

      (answer.confirm)
        ? finalCallback(answers)
        : run();
    });
  }

  function next(){
    if (questioner.queue.length) {
      questioner.running = questioner.queue[0];
      questioner.queue.splice(0, 1);

      ask(questioner.running, callback);
    } else {
      looksGood();
    }
  }

  function validator(validate) {
    if (typeof validate === 'string') {
      validate = {
        type: validate,
        message: 'Please complete this field'
      };
    }

    if (validate.type === 'notEmpty') {
      return function(value) {
        if (value.trim() === '') {
          return validate.message;
        }
        return true;
      }
    }
  }

  function run() {
    questioner.queue = questionsParse(questioner.questions);
    next();
  }

};
