#!/usr/bin/env node
import * as path from 'path'
import { processAllFiles } from './sourcemaps'
import * as parseArgs from "minimist";

const HELP_MSG = `USAGE:
srcmap-unpkg [OPTIONS] file1.js.map ...

OPTIONS:
    -h, --help                Print usage message
    -v, --version             Print version
    -i, --src-ignore-pattern  Ignore pattern for source files (default: node_modules)
    -m, --write-meta          Include meta information about the file as footer
    -o, --outdir path         Output directory (default: ./out)`;


    const argv = parseArgs(process.argv.slice(2), {
    string: ['outdir', 'src-ignore-pattern'],
    alias: {
        help: 'h',
        version: 'v',
        outdir: 'o',
        'src-ignore-pattern': 'i',
        'write-meta': 'm'
    },
    default: {
        output: 'out',
        'src-ignore-pattern': 'node_modules',
        'write-meta': true,
    },
    boolean: [
        'help',
        'version',
        'write-meta'
    ],
})

if (argv.help) {
    console.error(HELP_MSG)
    process.exit()
}

const files = argv._
if (!files.length) {
  console.error('Should specify at least one file or - for stdin\n')
  console.error(HELP_MSG)

  process.exit()
}

const opts = {writeMeta: argv['write-meta'], srcIgnorePattern: argv['src-ignore-pattern']}
processAllFiles(files, path.resolve(argv.output), opts)
