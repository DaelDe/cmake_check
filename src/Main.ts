import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import * as yargs from "yargs";
import {crawl} from "./FileCrawler";
import * as p from "./Parser";

const createLogger = require("logging");
const log = createLogger.default("cmake_style");

const opt = yargs
    .boolean("c").describe("c", "Force (re)creation of the database")
    .count("v").describe("v", "Increase verbosity level")
    .option("c", {
        alias: "config",
        demandOption: true,
        describe: "Rule configuration.",
        type: "string",
    })
    .help()
    .parse(process.argv);

//const file_path: path.ParsedPath = path.parse( opt.file );

const cmakePatterns = [
    new RegExp(/^CMakeLists\.txt$/),
    new RegExp(/.*\.cmake$/),
    new RegExp(/^CMakeLists \([0-9]+\)\.txt$/),
];

async function main() {
    try {
        console.time("took");

        const parser: p.CMakeParser = new p.CMakeParser();
        let numfiles: number = 0;
        await crawl( ".", cmakePatterns, (f) => {
            try {
                numfiles++;
                // todo: detach and do async
                const cmake: Buffer = fs.readFileSync(f);
                const cm: p.CMakeFile = parser.parse(cmake.toString());
            } catch (error) {
                console.log(f);
                console.log(error);
                process.exit(0);
            }
        } );

        console.log(numfiles);

//        const c = cm.command("target_link_libraries");
//        if ( c ) {
//            console.log(c.name);
//            console.log(c.argument("eigen"));
//        }
        // console.log(cm.commands())

        console.timeEnd("took");
    } catch (error) {
        console.log("catch");
        if ( error.name === "SyntaxError" /*instanceof pegjs.parser.SyntaxError*/ ) {
            log.error(`${error.location.start.line}:${error.location.start.column} ${error.message}`);
        } else {
        //    log.error(error.message);
        }
    }
}

main();
