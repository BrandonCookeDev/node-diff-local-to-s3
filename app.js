'use strict';

let fs = require('fs');
let path = require('path');
let uuid = require('uuid');
let temp = require('temp').track();
let diff = require('diff');
let colors = require('colors');
let AWS = require('aws-sdk');
let S3 = new AWS.S3({apiVersion: '2006-03-01'});
let s3UrlRegex = new RegExp(/^s3:\/\/([\S]*)\/([\S]*)$/i);

const USAGE = 'USAGE node app -l <absolute or relative path to file> -s <s3 url: [s3://bucket/key]>';

let program = require('commander');
program.version('1.0')
	.option('-l, --local <file>', 'Local file to diff')
	.option('-s --s3Url <url>', 'S3 file to diff')
	.parse(process.argv);

let localFile = program.local;
let s3FileUrl = program.s3Url;

function validateS3Url(url){
	return s3UrlRegex.test(url);
}

function parseS3Url(url){
	let parsed = s3UrlRegex.exec(url);
	console.log('Bucket %s, Key: %s', parsed[1], parsed[2]);
	return {
		Bucket: parsed[1],
		Key: parsed[2]
	}
}

async function getS3File(url){
	if(validateS3Url(url)){
		return await S3.getObject(parseS3Url(url)).promise();
	}
	else throw new Error('S3 url is not valid. Must be "s3://Bucket/Key"');
}

function writeTempFile(name, data){
	console.log('Writing temp file %s.', name);
	//console.debug('Data: %s', data);
	return new Promise(function(resolve, reject){
		temp.open(name, function(err, info){
			if(err) return reject(err);
			
			fs.writeSync(info.fd, data);
			fs.closeSync(info.fd);
			return resolve(info.path);
		})
	})
}

function getLocalFile(filename){
	let filepath = filename;
	if(!path.isAbsolute(filename)){
		filepath = path.resolve(filename);
	}
	return fs.readFileSync(filepath).toString('utf8');
}

function printDiff(differences){
	differences.forEach(function(part){
	  // green for additions, red for deletions
	  // grey for common parts
	  var color = part.added ? 'green' :
	    part.removed ? 'red' : 'grey';
	  process.stderr.write(part.value[color]);
	});

	if(differences.length == 1 && 
		!differences[0].hasOwnProperty('removed') && 
		!differences[0].hasOwnProperty('added'))
		console.log('Files match!'.green);
}

(async function(){
	try{
		if(!localFile || !s3FileUrl){
			throw new Error(USAGE + '\nMust have both local and s3 file options');
			process.exit(1);
		}

		let object = await getS3File(s3FileUrl);
		let s3Content = object.Body.toString('utf8');
		let localContent = getLocalFile(localFile);
		let differences = diff.diffLines(s3Content, localContent);

		printDiff(differences);

		temp.cleanupSync();
		return true;
	}
	catch(e){
		console.error(e.message.red);
		process.exit(1);
	}
})()