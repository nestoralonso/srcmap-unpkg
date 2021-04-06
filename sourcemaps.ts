import * as path from 'path'
import * as fsCb from 'fs'

const fs = fsCb.promises

interface ExtractionOptions {
    writeMeta: boolean
    srcIgnorePattern: string
}
export async function processAllFiles(paths: string[], out: string, opts: ExtractionOptions) {
    for (const p of paths) {
        await processMapFile(p, out, opts);
    }
}

async function writeFile(originalPath: string, content: string, outdir: string) {
    const sourcePath = sanityzePath(originalPath)
    const finalFilePath = path.join(outdir, sourcePath)

    console.log("🦊>>>> ~ ", { originalPath, finalFilePath, outdir })
    const dirpath = path.dirname(finalFilePath)
    await fs.mkdir(dirpath, { recursive: true })
    return fs.writeFile(finalFilePath, content)
}

function getMeta(dict: Object) {
    return Object.entries(dict).map(([k, v]) => `// ${k}: ${v}`).join('\n')
}

async function processMapFile(mapPath: string, out: string, opts: ExtractionOptions) {
    const mapContents = await fs.readFile(mapPath, { encoding: 'utf8', flag: 'r' })
    const map = JSON.parse(mapContents)

    const { sources, sourcesContent = [], file } = map;
    const ignoreSourceRegex = new RegExp(opts.srcIgnorePattern)
    const promises = [];
    console.log("🦊>>>> ~ processMapFile ~ opts", opts)
    for (let i = 0; i < sources.length; i++) {
        const srcPath = sources[i]

        if (opts.srcIgnorePattern && ignoreSourceRegex.test(srcPath)) {
            continue
        }
        let fileContent = sourcesContent[i]
        if (opts.writeMeta) {
            const meta = getMeta({ source: srcPath, srcmap: file });
            fileContent = `${fileContent}\n\n${meta}`
        }

        if (fileContent) {
            const writePromise = writeFile(srcPath, fileContent, out)
            promises.push(writePromise)

        }
    }

    return Promise.allSettled(promises)
}

function sanityzePath(srcPath: string) {
    let filePath = srcPath.replace(/[\x00-\x1f\x80-\x9f\?<>\\:\*\|"]/g, '')
    filePath = filePath.replace(/^(..\/)+/g, '')
    return path.normalize(filePath)
}