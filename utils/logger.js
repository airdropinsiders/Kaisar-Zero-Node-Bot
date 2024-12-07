import chalk from 'chalk';

export function logger(message, level = 'info', value = '') {
    const now = new Date().toISOString();

    const colors = {
        info: chalk.blue,
        warn: chalk.yellow,
        error: chalk.red,
        success: chalk.green,
        debug: chalk.magenta,
    };

    const color = colors[level] || chalk.white;
    const levelTag = `[${level.toUpperCase()}]`;
    const timestamp = `[${now}]`;

    const formattedMessage = `${color(timestamp)} ${color(levelTag)} ${message}`;

    let formattedValue = '';
    if (typeof value === 'object') {
        formattedValue = ` ${chalk.yellow(JSON.stringify(value))}`;
    } else if (value) {
        formattedValue = ` ${chalk.yellow(value)}`;
    }

    console.log(`${formattedMessage}${formattedValue}`);
}
