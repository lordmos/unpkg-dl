import arg from 'arg';
import colors from 'colors';
import downloadAll from './downloader.mjs';

function parseArgumentsIntoOptions(rawArgs) {
	const args = arg({
		'--src': String,
		'--output': String
	}, {
		argv: rawArgs.slice(2),
	});
	return {
		src: args['--src'] || "",
		output: args['--output'] || "./output"
	};
}

export function cli(args) {
	let options = parseArgumentsIntoOptions(args);
	if (!options.src) {
		console.log(colors.red('Error: ') + "Need src path like --src='https://unpkg.com/browse/pdfjs-dist@4.0.379/'");
		console.log(colors.yellow('Unpkg Downloader Tools:') + "unpkg-dl");
		console.log(colors.green('\t--output:') + "\toutput dir.");
		console.log(colors.yellow('For example:') + "\tunpkg-dl --src='https://unpkg.com/browse/pdfjs-dist@4.0.379/' --output='./output'");
	}

	if (options.src) {
		downloadAll(options.src, options.output);
	}
}
