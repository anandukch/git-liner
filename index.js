#!/usr/bin/env node
import inquirer from 'inquirer';
import GitClient from './service.js';
import chalk from 'chalk';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
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
      return answers.continue ? main() : console.log(chalk.green('Goodbye!'));
    })
  }

  promptDeleteRepo = () => {
    this.prompt(quesitons.deleteRepoQuestions).then(async (answers) => {
      const { projName } = answers;
      try {
        const res = await this.gitClient.deleteRepo(projName);
        console.log(chalk.green(`Successfully deleted repo ${projName}`));
        confirmContinue();
      } catch (error) {
        console.log(error);
        console.log(chalk.red(`Failed to delete repo ${projName} : ${error.response.data.message}`));
        this.confirmContinue();
      }
    })
  }

  promptCreateRepo = () => {
    this.prompt(quesitons.createRepoQuestions).then(async (answers) => {
      const { privateRepo, projName } = answers;
      try {
        const res = await this.gitClient.createRepo(projName, privateRepo);
        console.log(chalk.green(`Successfully created repo ${res.data.name}`));
        const answer = await this.prompt(quesitons.pushConfirmQuestion)
        if (!answer.push) {
          this.confirmContinue();
          return;
        }
        exec(
          this.gitClient.pushCommand(projName, "anandukch"), (err, stdout, stderr) => {
            if (err) {
              console.log(chalk.red(`   Failed to push to repo ${projName}`));
              return;
            }
            console.log(chalk.green(stdout));
            console.log(chalk.green(`Successfully pushed to repo ${projName}`));
            this.confirmContinue();
          }
        )

      } catch (error) {
        console.log(chalk.red(`Failed to create repo ${projName} : ${error.response.data.errors[0].message}`));
        this.confirmContinue();
      }
    })
  }

  main = () => {
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

}


// inquirer.registerPrompt('autocomplete', inquirerPrompt);
// const prompt = inquirer.prompt;
// const gitClient = new GitClient();

// const confirmContinue = () => {
//   prompt(quesitons.confirmContinueQuestion).then(async (answers) => {
//     return answers.continue ? main() : console.log(chalk.green('Goodbye!'));
//   })
// }

// const promptDeleteRepo = () => {
//   prompt(quesitons.deleteRepoQuestions).then(async (answers) => {
//     const { projName } = answers;
//     try {
//       const res = await gitClient.deleteRepo(projName);
//       console.log(chalk.green(`Successfully deleted repo ${projName}`));
//       confirmContinue();
//     } catch (error) {
//       console.log(chalk.red(`Failed to delete repo ${projName} : ${error.response.data.message}`));
//       confirmContinue();
//     }
//   })
// }

// const promptCreateRepo = () => {
//   prompt(quesitons.createRepoQuestions).then(async (answers) => {
//     const { privateRepo, projName } = answers;
//     try {
//       const res = await gitClient.createRepo(projName, privateRepo);
//       console.log(chalk.green(`Successfully created repo ${res.data.name}`));
//       const answer = await inquirer.prompt(quesitons.pushConfirmQuestion)
//       if (!answer.push) {
//         confirmContinue();
//         return;
//       }
//       exec(
//         gitClient.pushCommand(projName, "anandukch"), (err, stdout, stderr) => {
//           if (err) {
//             console.log(chalk.red(`   Failed to push to repo ${projName}`));
//             return;
//           }
//           console.log(chalk.green(stdout));
//           console.log(chalk.green(`Successfully pushed to repo ${projName}`));
//           confirmContinue();
//         }
//       )

//     } catch (error) {
//       console.log(chalk.red(`Failed to create repo ${projName} : ${error.response.data.errors[0].message}`));
//       confirmContinue();
//     }
//   })
// }

// const main = () => {
//   prompt(quesitons.baseQuestions).then(async (answers) => {
//     const { action } = answers;
//     switch (action) {
//       case "Create a new repo":
//         promptCreateRepo();
//         break;
//       case "Delete an existing repo":
//         promptDeleteRepo();
//         break;
//       case "Exit":
//         console.log(chalk.green('Goodbye!'));
//         break;
//     }
//   })
// }
new Prompt().gitClient.getUserName().then((res) => {
  console.log(chalk.green(`  Welcome ${res.data.login}`));
  new Prompt().main();
}).catch((err) => {
  console.log(chalk.red(`  Invalid token`));
  exit();
})










