import chalk from 'chalk';
import shell from 'shelljs';

// 如果shell出错则结束
shell.config.fatal = true;

export const log = (...args: any[]) => {
  // eslint-disable-next-line no-console
  console.log(...args);
};
