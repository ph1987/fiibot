import * as fs from 'node:fs';
import axios from 'axios';
import $ from 'cheerio';
import chalk from 'chalk';
import { urls } from './utils/urls.js';
import { loadingAnimation } from './utils/animation.js';
import { format } from 'date-fns';
import localePtBr from 'date-fns/locale/pt-BR';
import { ConfigFileAuthenticationDetailsProvider } from "oci-common";
import { ObjectStorageClient } from "oci-objectstorage";

const provider = new ConfigFileAuthenticationDetailsProvider();
const objectStorageClient   = new ObjectStorageClient({ authenticationDetailsProvider: provider });

const NAMESPACE = "axcyntfguubc";
const BUCKET  = "bucket-phldev";

const log = console.log;

async function saveFile(results) {
  const fileContent = results.map(item => item.value).join('\n');
  const date = new Date();
  const fileName = date.toISOString().split('T')[0];

	/*
  if (!fs.existsSync('history')) {
    fs.mkdirSync('history');
  }

  fs.writeFile(`./history/${fileName}.txt`, fileContent, (err) => {
    if (err) {
      console.error('Error saving file:', err);
    }
  });
	*/

  const jsonContent = results.map(item => {
    const parts = item.value.split('p/vp');
    const pvp = parts[1] ? parts[1].trim() : '';
    const cod = item.key;
    return { cod, pvp };
  });

  //fs.writeFileSync(`./history/${fileName}.json`, JSON.stringify(jsonContent, null, 2));

	const txtBody = Buffer.from(fileContent, "utf-8");
	await objectStorageClient.putObject({
		namespaceName: NAMESPACE,
		bucketName:    BUCKET,
		objectName:    `fiibot/history/txt/${fileName}.txt`,
		putObjectBody: txtBody
	});

	const jsonBody = Buffer.from(JSON.stringify(jsonContent, null, 2), "utf-8");
	await objectStorageClient.putObject({
		namespaceName: NAMESPACE,
		bucketName:    BUCKET,
		objectName:    `fiibot/history/json/${fileName}.json`,
		putObjectBody: jsonBody
	});
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchData(url, key) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    const html = response.data;

    const t = $('.indicators__box', html);
    let result = null;

    t.each((_, div) => {
      if ($(div).text().toLocaleLowerCase().includes('p/vp')) {
        const txt = $(div).text().replace(/\s{2,}/g, ' ').trim().toLocaleLowerCase();
        const value = Number(txt.split(' ')[1].replace(',', '.'));

        value > 1
          ? log(chalk.red(`   ${key}: ${txt}`))
          : log(chalk.green(`   ${key}: ${txt}`));

        result = `${key}: ${txt}`;
      }
    });

    return result;
  } catch (err) {
    console.error(chalk.red(`Error fetching ${key}: ${err.message}`));
    return null;
  }
}

async function resolveAfter2Seconds(refreshIntervalId) {
  clearInterval(refreshIntervalId);

  const date = new Date();
  const formattedDatePtBr = format(date, 'dd/MM/yyyy HH:mm:ss', { locale: localePtBr });

  console.log('\n\n─────────────────────────');
  console.log(`   ${formattedDatePtBr}`);
  console.log('─────────────────────────');

  const results = [];
  
  for (const [key, value] of Object.entries(urls)) {
		const result = await fetchData(value, key);
		if (result) {
			results.push({ key, value: result });
		}
		await delay(2000);
	}

  console.log('─────────────────────────\n');

  if (results.length) {
		await saveFile(results);
	}
}

async function asyncCall() {
  const refreshIntervalId = loadingAnimation();
  await resolveAfter2Seconds(refreshIntervalId);
}

asyncCall();