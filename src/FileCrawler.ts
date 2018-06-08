import * as fs from "fs";
import * as path from "path";
import * as util from "util";

type ICrawlCallback = (file: string) => void;
interface ICrawlOptions {
    exclude?: string[];
}

export async function crawl(directory: string, patterns: RegExp[], options: ICrawlOptions, cb: ICrawlCallback) {
    const rd = util.promisify(fs.readdir);

    const root = path.resolve(directory);
    // let directories: path.ParsedPath[] = [root];

    const search = await rd(root);
    const wait: Array< Promise<void> > = [];
    for (const element of search) {
        const absPath = path.join(root, element);
        const pathObj = path.parse(absPath);

        if (options.exclude && options.exclude.includes(element)) {
            continue;
        }

        if (fs.statSync(absPath).isDirectory()) {
//           console.log("crawl " + absPath );
            wait.push(crawl(absPath, patterns, options, cb));
        }

        if (patterns.some((patt) => patt.test(element))) {
            cb(absPath);
        }
    }
    await Promise.all( wait );
}
