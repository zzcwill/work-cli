#!/usr/bin/env node

import cli from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import pkg from '../package.json';
import Work from './work';
import { log } from './utils';

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

(async () => {
  log(chalk.cyan('=== work-cli ==='));

  cli.version(pkg.version);

  cli
    .command('init', { isDefault: true })
    .description('quickly create a project.')
    .action(() => {
      new Work().start();
    });

  cli.parse();
})();
