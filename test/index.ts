import {fs, path, delay} from '../src/deps.ts'
import {get} from "../src/request/index.ts";
import cache from './cache.js'


const allFiles = Object.keys(cache)
const total = allFiles.length
const base = 'https://publish-01.obsidian.md/access/d13b52e1b4b0f42498820e69337e329c/'
const root = path.resolve('dist')


let downloaded = 0
async function downloadFile(cursor: number) {
    const filepath = allFiles[cursor]

    // 判断是否命中缓存
    if (fs.existsSync(path.join(root, filepath))) {
        console.log(`${++downloaded}/${allFiles.length}(hit cache): ${filepath}`)
        return
    }
    const dir = path.dirname(path.join(root, filepath))

    if (!fs.existsSync(dir)) {
        Deno.mkdirSync(dir, {recursive: true})
    }

    const resp = await get(base + filepath, {}, {
        "Referer": "https://publish.obsidian.md/",
        "Origin": "https://publish.obsidian.md",
    })
    if (resp.status !== 200) {
        throw new Error(`${resp.status}: ${resp.statusText}`)
    }
    if (filepath.endsWith('.md')) {
        Deno.writeTextFileSync(path.join(root, filepath), await resp.text())
    } else {
        const buffer = await resp.arrayBuffer()
        Deno.writeFileSync(path.join(root, filepath), new Uint8Array(buffer))
    }
    console.log(`${++downloaded}/${allFiles.length}: ${filepath}`)
}

let cursor = 0
const failed: number[] = []
while(true) {
    if (cursor >= total) {
        break
    }
    const i = cursor++
    try {
        await downloadFile(i)
    } catch(e) {
        console.log(allFiles[i-1])
        console.log(e)
        failed.push(i-1)
        console.log(failed)
    }

    await delay(100)
}
