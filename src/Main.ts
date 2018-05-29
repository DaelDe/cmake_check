import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import * as pegjs from 'pegjs';

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
        let grammar:Buffer = fs.readFileSync("grammar/cmake.pegjs");
        let cmake:Buffer = fs.readFileSync("res/func.CMakeLists.txt");
        const parser = pegjs.generate(grammar.toString());
        console.log( JSON.stringify(parser.parse(cmake.toString()),null,2));
    } catch (error) {
        if( error.name == "SyntaxError" /*instanceof pegjs.parser.SyntaxError*/ ){
            log.error(`${error.location.start.line}:${error.location.start.column} ${error.message}`);
        }else{
        //    log.error(error.message);
        }
        console.log(error);
    }
}

main();
