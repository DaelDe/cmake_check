import * as avj from "ajv";
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
    console: new log.transports.Console({}),
//    file: new log.transports.File({ filename: 'combined.log', level: 'error' })
  };

const logger = log.createLogger({
    format: log.format.combine( log.format.simple(), log.format.colorize() ),
    level: "warn",
    levels: log.config.npm.levels,
    transports: [transports.console],
});

const opt = yargs
    .array("input").alias("input", "i").describe("i", "List of input CMakeLists.txt or folders")
    .count("v").describe("v", "Increase verbosity level (v:info, vv:verbose)")
    .option("c", {
        alias: "config",
        demandOption: true,
        describe: "Path to JSON config file",
        type: "string",
    })
    .demandOption(["config", "input"], "Please provide a configuration and input")
    .help().alias("help", "h")
    .option("o", {
        alias: "out",
        describe: "Output file name. Warnings are written to stdout when absent.",
        type: "string",
    })
    .option("write-json", {
        hidden: true,
        type: "boolean",
    })
    .locale("en")
    .argv;

if (opt.v === 1) {
    transports.console.level = "info";
} else if (opt.v >= 2) {
    transports.console.level = "verbose";
} else if (opt.v >= 3) {
    transports.console.level = "debug";
}

// load config
const config = JSON.parse( fs.readFileSync(opt.config).toString() );
// validate the given config file
const validator = new avj.default({
    jsonPointers: true,
});
const schema: Buffer = fs.readFileSync(`${__dirname}/../res/config.schema.json`);
const validate = validator.compile(JSON.parse(schema.toString()));
const valid = validate(config);

if (!valid && validate.errors) {
    validate.errors.forEach((error: avj.ErrorObject) => {
        // console.log(validate.errors);
        logger.error(`Configuration invalid, ${error.dataPath} ${error.message}`);
     });
    process.exit(1);
}

const ruleLogger = log.createLogger({
    format: log.format.combine(log.format.printf( (info) => info.message )),
    level: "info",
    levels: log.config.npm.levels,
    transports: [],
});

if (opt.out) {
    ruleLogger.add(
        new log.transports.File({
            filename: opt.out,
            level: "info",
            options: {flags: "w"}}),
    );
} else {
    ruleLogger.add(new log.transports.Console({}));
}

const cmakePatterns = [
    new RegExp(/^CMakeLists\.txt$/),
    // new RegExp(/.*\.cmake$/), // CMake modules are not yet supported
    new RegExp(/^CMakeLists\s*\([0-9]+\)\.txt$/),
];

const crawlOpts = { exclude: [".svn", ".git"] };

const rc: RuleChecker = new RuleChecker(logger, ruleLogger, {
    rules: config.cRules,
    writeJSON: opt["write-json"],
});

async function main() {
    try {
        logger.profile("took");

        try {
            await Promise.all( opt.input.map( async (element: string) => {
                const stats = fs.statSync(element);
                if (stats.isFile()) {
                    // call the parser
                    logger.info(`Checking ${element}`);
                    await rc.check(element);
                } else if (stats.isDirectory) {
                    logger.info(`Checking files in ${element}`);
                    await crawl( element, cmakePatterns, crawlOpts, async (f) => {
                        await rc.check(f);
                    });
                }
            }));
            rc.logSummary();
        } catch (e) {
            logger.error(e.message);
        }
        logger.profile("took");
    } catch (error) {
        logger.error(error.message);
    }
}

main();
