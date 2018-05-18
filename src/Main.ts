import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';

const createLogger = require('logging');  
const log = createLogger.default('cmake_style');


let opt = yargs
    .boolean('c').describe('c', 'Force (re)creation of the database')
    .count('v').describe('v','Increase verbosity level')
    .option('f',{
        alias:'file',
        demandOption:true,
        describe:'Trace text file or TraceMiner database.',
        type: 'string'
    })
    .help()
    .parse(process.argv);

let file_path: path.ParsedPath = path.parse( opt.file );


async function main() {
    try {

    } catch (error) {
        log.error(error);
        console.log(error);
    }
}

// draw a nice banner
log.info("start")

main();
