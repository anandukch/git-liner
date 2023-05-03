export default {
  baseQuestions: [
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
  ],
  createRepoQuestions: [

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
  ],
  deleteRepoQuestions: [
    {
      type: "input",
      name: "projName",
      message: "Enter the the name of your project: "
    }
  ],
  confirmContinueQuestion: [
    {
      type: "confirm",
      name: "continue",
      message: "Would you like to continue?",
      default: true
    }
  ],

  pushConfirmQuestion: [
    {
      type: "confirm",
      name: "push",
      message: "Would you like to push to this repo?",
      default: false
    }
  ],
  tokenQuestion: [
    {
      type: "input",
      name: "token",
      message: "Enter your github token: "

    }]

}
