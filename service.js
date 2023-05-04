import { Octokit } from '@octokit/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

class GitClient {
  constructor() {
    this.__filename = fileURLToPath(import.meta.url);
    this.__dirname = path.dirname(this.__filename);
    this.gitDirectoryPath = path.join(this.__dirname, '.git');
    !fs.existsSync(`${os.homedir()}/.ghcli`) &&  fs.mkdirSync(`${os.homedir()}/.ghcli`);
   
    this.credentialsPath = path.join(`${os.homedir()}/.ghcli`, '.credentials');
  }

  createGitClient = (GITHUB_TOKEN) => {
    this.git = new Octokit({
      auth: GITHUB_TOKEN
    }) 
  }

  async createRepo(projName, privateRepo = false) {
    const response = await this.git.request('POST /user/repos', {
      name: projName,
      description: '',
      homepage: '',
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

  pushCommand(projName, username, existing = false) {
    return `${!existing ? "git init &&":""} git add . && git commit -m "publishing" && git branch -M master && git remote add origin https://github.com/${username}/${projName}.git && git push -u origin master`;
  }

  getUserName() {
    return this.git.request('GET /user', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
  }

  isGitInitialized = () => {
    let exists = false;
    try {
      fs.readdirSync(this.gitDirectoryPath)
      exists = true;
      return exists;
    } catch (error) {
      return exists;
    }
  }

  isGitRemote = () => {
    let isRemote = false;
    try {
      const configPath = path.join(this.gitDirectoryPath, 'config');
      const data = fs.readFileSync(configPath, 'utf8')
      const regex = /url = .*/g;
      const result = data.match(regex);
      if (!result) {
        return isRemote;
      }
      isRemote = true;
      return isRemote;
    } catch (error) {
      return isRemote;
    }
  }

  storeCredentials = (username) => {
    fs.writeFileSync(this.credentialsPath, username);
    return this.readCredentials();
  }

  readCredentials = () => {
    return fs.readFileSync(this.credentialsPath, 'utf8')
  }
}

export default GitClient;