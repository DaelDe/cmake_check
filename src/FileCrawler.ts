import * as fs from "fs";
import * as path from "path";
import * as util from "util";

type ICrawlCallback = (file: string) => Promise<void>;
interface ICrawlOptions {
    exclude?: string[];
}

export async function crawl(directory: string, patterns: RegExp[], options: ICrawlOptions, cb: ICrawlCallback) {
    const rd = util.promisify(fs.readdir);
    const root = path.resolve(directory);

    const search = await rd(root);
    const wait: Array< Promise<void> > = [];
    for (const element of search) {
        const absPath = path.join(root, element);
        const pathObj = path.parse(absPath);

        if (options.exclude && options.exclude.includes(element)) {
            continue;
        }

        // recurse into sub-diorectories
        if (fs.statSync(absPath).isDirectory()) {
            await crawl(absPath, patterns, options, cb);
        }

        // callback on files
        if (patterns.some((patt) => patt.test(element))) {
            await cb(absPath);
        }
    }
}
