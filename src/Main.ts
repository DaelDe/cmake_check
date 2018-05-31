import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';
import * as p from './Parser';

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
        const parser: p.CMakeParser = new p.CMakeParser();

        let cmake:Buffer = fs.readFileSync("res/CT.CMakeLists.txt");
        let cm:p.CMakeFile = parser.parse(cmake.toString());
        let c = cm.command('target_link_libraries');
        if( c ){
            console.log(c.name);
            console.log(c.argument('eigen'))
        }
        //console.log(cm.commands())

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
