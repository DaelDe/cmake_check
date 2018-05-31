import * as fs from 'fs';
import * as pegjs from 'pegjs';

export interface Cursor{
    offset: number;
    line: number;
    column: number;
}

export interface Location{
    start: Cursor,
    end: Cursor
}

enum ArgumentType{
    quoted,
    unquoted,
    bracket
}

export interface Argument{
    class: ArgumentType,
    name: string,
    location: Location
}

export class Command{
    private c:any;

    constructor(cmd:any){
        this.c = cmd;
    }

    get name() :string{
        return this.c['name'];
    }

    argument(name:string):Argument|undefined {
        return this.c.args.find( (el:any)=>{
            if( el['type']=='argument' && el['name'] == name ){
                return el;
            }else{
                return undefined;
            }
        })
    }

    get arguments(): Argument[]{
        return this.c['args'].filter( (el:any) => {
            if( el['type'] == 'argument'){
                return el;
            }
        })
    }

    get location(): Location{
        return this.c['location'];
    }
}

export class CMakeFile{
    private cmake:Array<any>;

    constructor( cm:Array<Object> ){
        this.cmake = cm;
    }

    toString():string{
        return JSON.stringify(this.cmake, null, 2);
    }

    length():number{
        return this.cmake.length;
    }

    commands():Command[]{
        return this.cmake.filter( el => {
            return el['type'] == 'command';
        });
    }

    command(name:string):Command|undefined{
        return new Command(
                this.cmake.find( (el:any)=>{
                    return ( el['type']=='command' && el['name'] == name );
                }
            )
        );
    }
}

export class CMakeParser{
    private parser:pegjs.Parser;

    constructor(){
        let grammar:Buffer = fs.readFileSync("grammar/cmake.pegjs");
        this.parser= pegjs.generate(grammar.toString());
    }
    
    parse( text:string ):CMakeFile{
        return new CMakeFile( this._parse(text) );
    }

    _parse( text:string ):any[]{
        return this.parser.parse(text);
    }
}
