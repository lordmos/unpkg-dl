import colors from 'colors';
import fs from "fs";
import path from "path";
import axios from "axios";
import puppeteer from 'puppeteer';

export default function downloadAll(src, output) {
	output = output.replace("./", "");
	if (!fs.existsSync(output)) {
		fs.mkdirSync(output)
	}
	parseAndDownload(src, path.join(output));
}

async function parseAndDownload(src, output) {
	const data = await parseData(src);
	const dataObj = JSON.parse(data);
	for (const item in dataObj.target.details) {
		const itemData = dataObj.target.details[item];
		const currentPath = itemData.path.replace(dataObj.target.path, "");
		if (itemData.type === "directory") {
			await parseAndDownload(src + currentPath + '/', path.join(output, currentPath));
		} else if (itemData.type === "file") {
			downloadFile(src + currentPath, output, currentPath);
		}

	}

}

async function parseData(srcDir) {
	console.log(colors.green("Parsing: ") + srcDir);
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(srcDir);
	const data = await page.evaluate(() => JSON.stringify(window.__DATA__));
	await browser.close();
	return data;
}

async function downloadFile(srcDir, output, fileName) {
	const prepareFinish = fs.existsSync(output);
	if (!prepareFinish) {
		fs.mkdirSync(output, { recursive: true });
	}
	if (fs.existsSync(path.join(output, fileName))) {
		return;
	}

	const response = await axios.get(srcDir.replace('/browse', ''), { responseType: 'stream' });
	response.data.pipe(fs.createWriteStream(path.join(output, fileName)));
	return new Promise((resolve, reject) => {
		response.data.on('end', () => {
			console.log(colors.green("Downloaded: ") + srcDir);
			resolve();
		});
		response.data.on('error', () => {
			console.log(colors.red("Error: ") + srcDir);
			reject();
		});
	});
}
