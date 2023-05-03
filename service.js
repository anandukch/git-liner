import { Octokit } from '@octokit/core';


class GitClient {
  constructor() {
    this.git = new Octokit({
      auth: process.env.GITHUB_TOKEN
    })
  }

  async createRepo(projName, privateRepo = false) {
    const response = await this.git.request('POST /user/repos', {
      name: projName,
      description: '',
      homepage: 'https://github.com',
      'private': privateRepo,
      is_template: false,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    return response
  }

  async deleteRepo(projName) {
    const response = await this.git.request('DELETE /repos/{owner}/{repo}', {
      owner: 'anandukch',
      repo: projName,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    return response
  }

  async getRepos() {
    const response = await this.git.request('GET /user/repos', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    return response
  }

  pushCommand(projName, username) {
    return `git init && git add . && git commit -m "publishing" && git branch -M master && git remote add origin https://github.com/${username}/${projName}.git && git push -u origin master`;
  }
}

export default GitClient;