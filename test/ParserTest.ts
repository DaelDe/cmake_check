import { expect, assert } from "chai";
import "mocha";
import {CMakeParser} from "../src/Parser";

const hello = () => "Hello world!";
const p = new CMakeParser();

// the location property of returned objects is removed for testing, it is created by peg.js itself

describe("The Peg.js parser for the CMake language", () => {
    describe("whitespace", () => {
        it("line with only whitespace", () => {
            const r: any[] = p._parse(`   `);
            assert.lengthOf(r, 1);

            assert.propertyVal(r[0], "type", "whitespace");
            assert.propertyVal(r[0], "class", "space");
            assert.propertyVal(r[0], "value", "   ");
        });
    });

    describe("bracket comments", () => {
        it("with closing brackets inside", () => {
            const r: any[] = p._parse(`#[=======================================================================[.rst:
                csharp_set_windows_forms_properties([<file1> [<file2> [...]]]])
            #]=======================================================================]
            test()
            `);
            //assert.lengthOf(r, 1);

            //assert.propertyVal(r[0], "type", "whitespace");
            //assert.propertyVal(r[0], "class", "space");
            //assert.propertyVal(r[0], "value", "   ");
        });
    });

    describe("line comments", () => {
        it("line comment without text", () => {
            const r: any[] = p._parse(`#\n`);
            assert.lengthOf(r, 2);

            assert.propertyVal(r[0], "type", "comment");
            assert.propertyVal(r[0], "class", "line");
            assert.propertyVal(r[0], "value", "");
        });

        it("basic line comment with unix line ending", () => {
            const r = p._parse(`#comment\n`)
            assert.lengthOf(r, 2);

            assert.propertyVal(r[0], "type", "comment");

            assert.propertyVal(r[1], "type", "whitespace");
            assert.propertyVal(r[1], "class", "newline");
            assert.propertyVal(r[1], "value", "\n");
        });

        it("line comment after function", () => {
            const r = p._parse(`func()#test\n`);
            assert.lengthOf(r, 3);

            assert.propertyVal(r[1], "type", "comment");
            assert.propertyVal(r[1], "class", "line");
            assert.propertyVal(r[1], "value", "test");
        });

        it("line comment after function, sep by space", () => {
            const r = p._parse(`func() #test\n`);
            assert.lengthOf(r, 4);

            assert.propertyVal(r[2], "type", "comment");
            assert.propertyVal(r[2], "class", "line");
            assert.propertyVal(r[2], "value", "test");
        });

        it("line comment after function argument", () => {
            const r = p._parse(`func(
                ARG #this is arg
            )\n`);
            assert.lengthOf(r, 2);

            const c = r[0].args[4];
            assert.propertyVal(c , "type", "comment");
            assert.propertyVal(c, "class", "line");
            assert.propertyVal(c, "value", "this is arg");
        });

        it("line comment special characters", () => {
            const r = p._parse(`#+*#'-_.:,;<>^°!"§$%&/()=?\n`);
            assert.lengthOf(r, 2);

            assert.propertyVal(r[0], "type", "comment");
            assert.propertyVal(r[0], "class", "line");
            assert.propertyVal(r[0], "value", '+*#\'-_.:,;<>^°!"§$%&/()=?');
        });

        it("line comment with EOF", () => {
            const r = p._parse(`#no crlf`);
            assert.lengthOf(r, 1);

            assert.propertyVal(r[0], "type", "comment");
            assert.propertyVal(r[0], "class", "line");
            assert.propertyVal(r[0], "value", "no crlf");
        });

    });

    describe("command invocations", () => {
        it("one line command", () => {
            const r: any[] = p._parse(`add_executable(hello_world.c)\n`);
            assert.lengthOf(r, 2);

            assert.propertyVal(r[0], "type", "command");
            assert.propertyVal(r[0], "name", "add_executable");
            assert.propertyVal(r[0].args[0], "type", "argument");
            assert.propertyVal(r[0].args[0], "class", "unquoted");
            assert.propertyVal(r[0].args[0], "name", "hello_world.c");
        });

        it("command and EOF", () => {
            const r: any[] = p._parse(`add_executable(hello_world.c)`);
            assert.lengthOf(r, 1);

            assert.propertyVal(r[0], "type", "command");
            assert.propertyVal(r[0], "name", "add_executable");
            assert.propertyVal(r[0].args[0], "type", "argument");
            assert.propertyVal(r[0].args[0], "class", "unquoted");
            assert.propertyVal(r[0].args[0], "name", "hello_world.c");
        });

        it("legacy unquoted argument", () => {
            const r: any[] = p._parse(`f(-dDEF="foo")`);
            assert.lengthOf(r, 1);

            assert.propertyVal(r[0], "type", "command");
            assert.propertyVal(r[0], "name", "f");
            assert.propertyVal(r[0].args[0], "type", "argument");
            assert.propertyVal(r[0].args[0], "class", "unquoted");
            assert.propertyVal(r[0].args[0], "name", `-dDEF="foo"`);
        });

    });
});
