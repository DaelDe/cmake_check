import * as avj from "ajv";
import * as fs from "fs";
import * as yargs from "yargs";
import {crawl} from "./FileCrawler";
import {createLogger, createRuleLogger, transports} from "./Logging";
import RuleChecker from "./Rules/RuleChecker";

// application logging
const logger = createLogger();

// cmake_check option definition
const opt = yargs
    .array("input").alias("input", "i").describe("i", "List of input CMakeLists.txt or folders")
    .count("v").describe("v", "Increase verbosity level (v:info, vv:verbose)")
    .option("c", {
        alias: "config",
        describe: "Path to JSON config file",
        type: "string",
    })
    .demandOption(["input"], "Please provide input")
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

// load configuration
let config: any;
if (opt.config) {
    config = JSON.parse( fs.readFileSync(opt.config).toString() );
} else {
    config = JSON.parse( fs.readFileSync(`${__dirname}/../res/config.json`).toString());
}

// validate the given config file against a schema
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

// logging for rule results (analysis warnings)
const ruleLogger = createRuleLogger( opt.out );

// file names that are checked
const cmakePatterns = [
    new RegExp(/^CMakeLists\.txt$/),
    // new RegExp(/.*\.cmake$/), // CMake modules are not yet supported
    new RegExp(/^CMakeLists\s*\([0-9]+\)\.txt$/),
];

const crawlOpts = { excludePaths: [] };
if (config.crawler.excludePaths) {
    crawlOpts.excludePaths = config.crawler.excludePaths.map( (r: string) => new RegExp(r) );
}

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
                    }, logger);
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
