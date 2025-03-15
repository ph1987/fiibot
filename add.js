import * as fs from 'node:fs';
import * as readline from 'node:readline';

// File path where the URLs are defined
const filePath = './utils/urls.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Fund name: ', (fundName) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      rl.close();
      return;
    }

    const fundRegex = new RegExp(`^\\s*${fundName}\\s*:`, 'm');
    if (fundRegex.test(data)) {
      console.log('Fund already exists!');
      rl.close();
      return;
    }

    const newEntry = `  ${fundName}: 'https://www.fundsexplorer.com.br/funds/${fundName}',\n`;

    const pos = data.lastIndexOf('};');
    if (pos === -1) {
      console.error('Unexpected file format.');
      rl.close();
      return;
    }

    const newContent = data.slice(0, pos) + newEntry + data.slice(pos);

    fs.writeFile(filePath, newContent, (err) => {
      if (err) {
        console.error('Error writing the file:', err);
      } else {
        console.log('Record successfully added!');
      }
      rl.close();
    });
  });
});