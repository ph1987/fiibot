import * as fs from 'node:fs';
import rp from 'request-promise';
import $ from 'cheerio';
import chalk from 'chalk';
import { urls } from './utils/urls.js';
import { loadingAnimation } from './utils/animation.js';
import { format } from 'date-fns';
import localePtBr from 'date-fns/locale/pt-BR';

const log = console.log;

function saveFile(results) {
  const fileContent = results;
  const date = new Date();
  const fileName = date.toISOString().split('T')[0];

  if (!fs.existsSync('history')) {
    fs.mkdirSync('history');
  }

  fs.writeFile(`./history/${fileName}.txt`, fileContent, (err) => {
      if (err) {
        console.error('Erro ao salvar o arquivo:', err);
      }
  });
}

function resolveAfter2Seconds(refreshIntervalId) {
  return new Promise(() => {
    setTimeout(() => {
      let count = 0;
      const size = Object.keys(urls).length;
      let results = '';
      clearInterval(refreshIntervalId);
      const date = new Date();
      const formattedDatePtBr = format(date, 'dd/MM/yyyy HH:mm:ss', { locale: localePtBr });
      console.log('\n\n─────────────────────────');
      console.log(`   ${formattedDatePtBr}`);
      console.log('─────────────────────────');
      for (const [key, value] of Object.entries(urls)) {
        rp(value)
          .then((html)=> {
            const t = $('.indicators__box', html);
            t.each((_, div) => {
              if ($(div).text().toLocaleLowerCase().includes('p/vp')) {
                const txt = $(div).text().replace(/\s{2,}/g, ' ').trim().toLocaleLowerCase();
                const value = Number(txt.split(' ')[1].replace(',', '.'));
                value > 1 ? log(chalk.red(`   ${key}: ${txt}`)) : log(chalk.green((`   ${key}: ${txt}`)));
                results += `${key}: ${txt}\n`;
                count++;
                if (count === size) {
                  saveFile(results);
                  console.log('─────────────────────────\n');
                }
              }
            });
          })
          .catch((err)=> {
            chalk.red(err);
        });
      }
    }, 2000);
  });
}

async function asyncCall() {
  const refreshIntervalId = loadingAnimation();
  await resolveAfter2Seconds(refreshIntervalId);
}

asyncCall();