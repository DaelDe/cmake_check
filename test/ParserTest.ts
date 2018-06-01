import { expect,assert } from 'chai';
import 'mocha';
import {CMakeParser} from '../src/Parser';

const hello = () => "Hello world!";
let p = new CMakeParser();

// the location property of returned objects is removed for testing, it is created by peg.js itself

describe('The Peg.js parser for the CMake language', () => {
    describe('line comments', () => {
        it('basic line comment with trailing space and windows line ending', () => {
            let r:any[] = p._parse(`# hello world\r\n`)
            assert.lengthOf(r,2);

            assert.propertyVal(r[0],'type','comment');
            assert.propertyVal(r[0],'class','line');
            assert.propertyVal(r[0],'value',' hello world');

            assert.propertyVal(r[1],'type','whitespace');
            assert.propertyVal(r[1],'class','newline');
            assert.propertyVal(r[1],'value','\r\n');
        });

        it('basic line comment with unix line ending', () => {
            let r = p._parse(`#comment\n`)
            assert.lengthOf(r,2);
            
            assert.propertyVal(r[0],'type','comment');

            assert.propertyVal(r[1],'type','whitespace');
            assert.propertyVal(r[1],'class','newline');
            assert.propertyVal(r[1],'value','\n');
        });    

        it('line comment after function', () => {
            let r = p._parse(`func()#test\n`)
            assert.lengthOf(r,3);
            
            assert.propertyVal(r[1],'type','comment');
            assert.propertyVal(r[1],'class','line');
            assert.propertyVal(r[1],'value','test');
        });    

        it('line comment after function, sep by space', () => {
            let r = p._parse(`func() #test\n`)
            assert.lengthOf(r,4);
            
            assert.propertyVal(r[2],'type','comment');
            assert.propertyVal(r[2],'class','line');
            assert.propertyVal(r[2],'value','test');
        });    

        it('line comment after function argument', () => {
            let r = p._parse(`func(
                ARG #this is arg
            )\n`)
            assert.lengthOf(r,2);
            
            let c = r[0]['args'][4];
            assert.propertyVal(c ,'type','comment');
            assert.propertyVal(c,'class','line');
            assert.propertyVal(c,'value','this is arg');
        });    

        it('line comment special characters', () => {
            let r = p._parse(`#+*#'-_.:,;<>^°!"§$%&/()=?\n`)
            assert.lengthOf(r,2);
            
            assert.propertyVal(r[0],'type','comment');
            assert.propertyVal(r[0],'class','line');
            assert.propertyVal(r[0],'value','+*#\'-_.:,;<>^°!"§$%&/()=?');
        });    

    });

    describe('command invocations', () => {
        it('one line command', () => {
            let r:any[] = p._parse(`add_executable(hello_world.c)\n`)
            assert.lengthOf(r,2);

            assert.propertyVal(r[0],'type','command');
            assert.propertyVal(r[0],'name','add_executable');
            assert.propertyVal(r[0]['args'][0],'type','argument');
            assert.propertyVal(r[0]['args'][0],'class','unquoted');
            assert.propertyVal(r[0]['args'][0],'name','hello_world.c');
        });
    });
});