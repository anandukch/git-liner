#!/usr/bin/env node
import inquirer from 'inquirer';
import GitClient from './service.js';
import chalk from 'chalk';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { config } from "dotenv"
import { exec } from 'child_process';

config();

inquirer.registerPrompt('autocomplete', inquirerPrompt);
const prompt = inquirer.prompt;
const gitClient = new GitClient();

const baseQuestions = [
  {
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: [
      "Create a new repo",
      "Delete an existing repo",
      "Exit"
    ]
  }
]
const createRepoQuestions = [

  {
    type: "name",
    name: "projName",
    message: "Enter the the name of your project: ",
  }, {
    type: "confirm",
    name: "privateRepo",
    message: "Would you like to make this repo private?",
    default: true
  }
]

const deleteRepoQuestions = [
  {
    type: "input",
    name: "projName",
    message: "Enter the the name of your project: ",
    source: async (answersSoFar, input) => {
      const res = await gitClient.getRepos();
      const repos = res.data.map(repo => repo.name);
      return repos.filter(repo => repo.includes(input));
    }
  }
]

const confirmContinueQuestion = [
  {
    type: "confirm",
    name: "continue",
    message: "Would you like to continue?",
    default: false
  }
]
const confirmContinue = () => {
  prompt(confirmContinueQuestion).then(async (answers) => {
    return answers.continue ? main() : console.log(chalk.green('Goodbye!'));
  })
}

const promptDeleteRepo = () => {
  prompt(deleteRepoQuestions).then(async (answers) => {
    const { projName } = answers;
    try {
      const res = await gitClient.deleteRepo(projName);
      console.log(chalk.green(`Successfully deleted repo ${projName}`));
      confirmContinue();
    } catch (error) {
      console.log(chalk.red(`Failed to delete repo ${projName} : ${error.response.data.message}`));
      confirmContinue();
    }
  })
}

const promptCreateRepo = () => {
  prompt(createRepoQuestions).then(async (answers) => {
    const { privateRepo, projName } = answers;
    try {
      const res = await gitClient.createRepo(projName, privateRepo);
      console.log(chalk.green(`Successfully created repo ${res.data.name}`));
      const answer=await inquirer.prompt([
        {
          type: "confirm",
          name: "push",
          message: "Would you like to push to this repo?",
          default: true
        }
      ])
      if(!answer.push){
        confirmContinue();
        return;
      }
      exec(
        gitClient.pushCommand(projName, "anandukch"), (err, stdout, stderr) => {
          if (err) {
            console.log(chalk.red(`   Failed to push to repo ${projName}`));
          }
          console.log(chalk.green(stdout));
          console.log(chalk.green(`Successfully pushed to repo ${projName}`));
          confirmContinue();
        }
      )

    } catch (error) {
      console.log(chalk.red(`Failed to create repo ${projName} : ${error.response.data.errors[0].message}`));
      confirmContinue();
    }
  })
}

const main = () => {
  prompt(baseQuestions).then(async (answers) => {
    const { action } = answers;
    switch (action) {
      case "Create a new repo":
        promptCreateRepo();
        break;
      case "Delete an existing repo":
        promptDeleteRepo();
        break;
      case "Exit":
        console.log(chalk.green('Goodbye!'));
        break;
    }
  })
}

main()








