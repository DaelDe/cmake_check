import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import * as log from "winston";
import * as yargs from "yargs";
import {crawl} from "./FileCrawler";
import RuleChecker from "./Rules/RuleChecker";

/*
tasks
- using the config options
- create object that verifies files (check if valid CMake + rulesets)
*/

const transports = {
    console: new log.transports.Console({ level: "info" }),
//    file: new log.transports.File({ filename: 'combined.log', level: 'error' })
  };

const logger = log.createLogger({
    format: log.format.combine( log.format.simple(), log.format.colorize() ),
    level: "info",
    levels: log.config.npm.levels,
    transports: [transports.console],
});

const opt = yargs
    .array("input").alias("input", "i").describe("i", "list of input CMakeLists.txt or folders")
    .count("v").describe("v", "Increase verbosity level")
    .config().alias("config", "c")
    .demandOption(["config", "input"], "Please provide a configuration and input")
    .help().alias("help", "h")
    .option("o", {
        alias: "out",
        demandOption: true,
        describe: "output file name",
        type: "string",
    })
    .argv;

if (opt.v === 1) {
    transports.console.level = "verbose";
} else if (opt.v >= 2) {
    transports.console.level = "debug";
}

const ruleLogger = log.createLogger({
    format: log.format.combine(log.format.simple()),
    level: "warn",
    levels: log.config.npm.levels,
    transports: [new log.transports.File({
        filename: opt.out,
        options: {flags: "w"},
        level: "info",
    })],
});

const cmakePatterns = [
    new RegExp(/^CMakeLists\.txt$/),
    // new RegExp(/.*\.cmake$/), // CMake modules are not yet supported
    new RegExp(/^CMakeLists\w*\([0-9]+\)\.txt$/),
];

const crawlOpts = { exclude: [".svn", ".git"] };

const rc: RuleChecker = new RuleChecker(logger, ruleLogger, opt.cRuleSets);

async function main() {
    try {
        logger.profile("took");

        try {
            opt.input.forEach( (element: string) => {
                const stats = fs.statSync(element);
                if (stats.isFile()) {
                    // call the parser
                    rc.check(element);
                } else if (stats.isDirectory) {
                    /* TBD: store promises*/ crawl( element, cmakePatterns, crawlOpts, (f) => {
                        rc.check(f);
                    });
                }
            });
        } catch (e) {
            logger.error(e.message);
        }
        logger.profile("took");
    } catch (error) {
        logger.error(error.message);
    }
}

main();
