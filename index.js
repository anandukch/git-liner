#!/usr/bin/env node
import inquirer from 'inquirer';
import GitClient from './service.js';
import chalk from 'chalk';
import { config } from "dotenv"
import { exec } from 'child_process';
import { exit } from 'process';
import quesitons from './quesitons.js';

config();

class Prompt {
  constructor() {
    this.prompt = inquirer.prompt;
    this.gitClient = new GitClient();
  }

  confirmContinue = () => {
    this.prompt(quesitons.confirmContinueQuestion).then(async (answers) => {
      return answers.continue ? this.main() : console.log(chalk.green('Goodbye!'));
    })
  }

  promptDeleteRepo = () => {
    this.prompt(quesitons.deleteRepoQuestions).then(async (answers) => {
      const { projName } = answers;
      try {
        const res = await this.gitClient.deleteRepo(projName);
        console.log(chalk.green(`  Successfully deleted repo ${projName}`));
        this.confirmContinue();
      } catch (error) {
        console.log(chalk.red(`  Failed to delete repo ${projName} : ${error.response.data.message}`));
        this.confirmContinue();
      }
    })
  }

  promptCreateRepo = () => {
    this.prompt(quesitons.createRepoQuestions).then(async (answers) => {
      const { privateRepo, projName } = answers;
      try {

        // console.log(this.username);
        const res = await this.gitClient.createRepo(projName, privateRepo);
        console.log(chalk.green(`    Successfully created repo ${res.data.name}`));
        if (this.gitClient.isGitRemote()) {
          this.confirmContinue();
          return;
        }
        const answer = await this.prompt(quesitons.pushConfirmQuestion)
        if (!answer.push) {
          this.confirmContinue();
          return;
        }
        exec(
          this.gitClient.pushCommand(projName, this.username, this.gitClient.isGitInitialized()), (err, stdout, stderr) => {
            if (err) {
              console.log(chalk.red(`   Failed to push to repo ${projName}`));
              return;
            }
            console.log(chalk.green(stdout));
            console.log(chalk.green(`   Successfully pushed to repo ${projName}`));
            this.confirmContinue();
          }
        )
      } catch (error) {
        console.log(chalk.red(`Failed to create repo ${projName} : ${error.response.data.errors[0].message}`));
        this.confirmContinue();
      }
    })
  }

  checkCredentials = async () => {
    try {
      this.gitClient.createGitClient(this.gitClient.readCredentials());
    } catch (error) {
      const { token } = await this.prompt(quesitons.tokenQuestion);
      this.gitClient.createGitClient(this.gitClient.storeCredentials(token));
    }
  }

  validateUsername = async () => {
    try {
      const authenticated = await this.gitClient.getUserName();
      this.username = authenticated.data.login;
    } catch (error) {
      // console.log(chalk.red(`  Invalid token`));
      const { token } = await this.prompt(quesitons.tokenQuestion);
      this.gitClient.createGitClient(this.gitClient.storeCredentials(token));
      // exit();
    }
  }

  main = async () => {

    await this.checkCredentials();
    await this.validateUsername();

    this.prompt(quesitons.baseQuestions).then(async (answers) => {
      const { action } = answers;
      switch (action) {
        case "Create a new repo":
          this.promptCreateRepo();
          break;
        case "Delete an existing repo":
          this.promptDeleteRepo();
          break;
        case "Exit":
          console.log(chalk.green('Goodbye!'));
          break;
      }
    })
  }

  test() {
    console.log('test');
    // let s = this.gitClient.pushCommand("projName", "dfsdf", false);
    console.log(s);
  }

}

new Prompt().main();














