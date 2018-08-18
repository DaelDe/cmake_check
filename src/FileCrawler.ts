import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { Logger } from "../node_modules/winston";

type ICrawlCallback = (file: string) => Promise<void>;
interface ICrawlOptions {
    excludePaths?: RegExp[];
}

// tslint:disable-next-line:max-line-length
export async function crawl(directory: string, patterns: RegExp[], options: ICrawlOptions, cb: ICrawlCallback, log: Logger) {
    const rd = util.promisify(fs.readdir);
    const root = path.resolve(directory);

    const search = await rd(root);
    const wait: Array< Promise<void> > = [];
    for (const element of search) {
        const absPath = path.join(root, element);
        const pathObj = path.parse(absPath);

        // recurse into sub-diorectories
        if (fs.statSync(absPath).isDirectory()) {
            if (options.excludePaths) {
                if (options.excludePaths.every((p) => !p.test(absPath))) {
                    await crawl(absPath, patterns, options, cb, log);
                } else {
                    log.info(`Path skipped by configuration: ${absPath}`);
                }
            } else {
                await crawl(absPath, patterns, options, cb, log);
            }
        } else if (patterns.some((patt) => patt.test(element))) {
            await cb(absPath);
        }
    }
}
