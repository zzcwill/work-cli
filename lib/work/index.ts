import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import download from 'download';
import chalk from 'chalk';
import ora from 'ora';
import spawn from 'cross-spawn';
import { projectData } from '../constants';
import { log } from '../utils';

export default class Work {
  spinner = ora('loading...');

  loadingStart(text = 'loading...') {
    this.spinner.text = text;
    this.spinner.start();
  }

  loadingStop() {
    this.spinner.stop();
  }

  renamePkgNameByDir(targetDir: string) {
    const pkgPath = path.join(targetDir, 'package.json');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require(pkgPath);
    pkg.name = path.basename(targetDir);
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  }

  async process(): Promise<void> {
    const { chooseProjectName, dirName } = await inquirer.prompt([
      {
        name: 'chooseProjectName',
        type: 'autocomplete',
        message: 'please select a template.',
        source: async (answers: any, input: string) => {
          let showProjects = projectData;
          if (input) {
            showProjects = projectData.filter(
              (project) => project.name.includes(input) || project.description.includes(input)
            );
          }
          return showProjects.map((project) => {
            return {
              name: `${project.name} ${chalk.gray(project.description)}`,
              short: project.name,
              value: project.name
            };
          });
        }
      },
      {
        name: 'dirName',
        type: 'input',
        message: 'please input the target directory("." means current directory)',
        default: '.',
        validate: (input) => {
          return !!input;
        }
      }
    ]);

    const targetDir = path.resolve(process.cwd(), dirName);

    if (fs.existsSync(targetDir)) {
      const childFileList = fs.readdirSync(targetDir).filter((file) => {
        // ignore .git dir, maybe it is a empty git repo
        return file !== '.git';
      });

      if (childFileList.length) {
        const { shouldContinue } = await inquirer.prompt({
          name: 'shouldContinue',
          type: 'confirm',
          message: 'The file(s) above will be overwritten. Do you want to continue?'
        });
        if (!shouldContinue) {
          process.exit();
        }
      }
    }
    const downloadOptions = {
      extract: true,
      strip: 1
    };
    this.loadingStart('downloading template...');
    const downloadProject = `https://github.com/zzcwill/${chooseProjectName}/archive/refs/heads/main.zip`;
    console.info('downloadProject', downloadProject);
    await download(downloadProject, dirName, downloadOptions);
    this.loadingStop();
    this.renamePkgNameByDir(targetDir);
    // return new Promise((resolve) => {
    //   const ps = spawn('yarn', [], { cwd: targetDir, stdio: 'inherit' });

    //   ps.on('close', (code) => {
    //     resolve();
    //   });
    // });
  }

  async start() {
    log(chalk.cyan(`=== start work ===`));
    try {
      await this.process();
    } catch (error) {
      console.error(error);
    }
    log(chalk.cyan(`=== end work ===`));
  }
}
