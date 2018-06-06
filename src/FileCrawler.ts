import * as fs from "fs";
import * as path from "path";
import * as util from "util";

type ICrawlCallback = ( file: string ) => void;

export async function crawl( directory: string, patterns: RegExp[], cb: ICrawlCallback ) {
    const rd = util.promisify( fs.readdir );

    const root = path.resolve( directory );
    // let directories: path.ParsedPath[] = [root];

    const search = await rd( root );
    for (const element of search) {
        const absPath = path.join( root, element );
        const pathObj = path.parse( absPath );

        if ( patterns.some( (patt) => patt.test( element ) ) ) {
            cb( absPath );
        }

        if (fs.statSync( absPath ).isDirectory()) {
           // console.log("crawl " + absPath );
           await crawl( absPath, patterns, cb );
       }
    }
}
