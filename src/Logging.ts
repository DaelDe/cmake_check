import * as log from "winston";

export const transports = {
    console: new log.transports.Console({}),
    //    file: new log.transports.File({ filename: 'combined.log', level: 'error' })
};

export function createLogger(): log.Logger {
    const logger = log.createLogger({
        format: log.format.combine(log.format.simple(), log.format.colorize()),
        level: "warn",
        levels: log.config.npm.levels,
        transports: [transports.console],
    });

    return logger;
}

export function createRuleLogger( file: string|null ): log.Logger {
    const ruleLogger = log.createLogger({
        format: log.format.combine(log.format.printf( (info) => info.message )),
        level: "info",
        levels: log.config.npm.levels,
        transports: [],
    });

    if (file) {
        ruleLogger.add(
            new log.transports.File({
                filename: file,
                level: "info",
                options: {flags: "w"}}),
        );
    } else {
        ruleLogger.add(new log.transports.Console({}));
    }

    return ruleLogger;
}
