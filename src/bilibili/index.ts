import {get, head} from "../request/index.ts";
import {path, fs, ffmpeg} from "../deps.ts";
import {pad} from "../utils.ts";
import logger from "./logger.ts";


const urls = [
    // "https://xy118x184x254x37xy.mcdn.bilivideo.cn:4483/upgcxcode/51/72/1492277251/1492277251-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1713069101&gen=playurlv2&os=mcdn&oi=1961748921&trid=000077df57e88f504c028f6ed5fd09dc938dp&mid=487408043&platform=pc&upsig=908ab2a6842ad24878c1ed9d2dcac662&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,mid,platform&mcdnid=50002374&bvc=vod&nettype=0&orderid=0,3&buvid=FF99AEDB-E818-7282-3FC0-8011B43A137555605infoc&build=0&f=p_0_0&agrr=0&bw=23183&logo=A0020000",
    "https://xy222x136x90x162xy.mcdn.bilivideo.cn:4483/upgcxcode/08/81/1504638108/1504638108-1-100023.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1713188648&gen=playurlv2&os=mcdn&oi=460526662&trid=000081a087a95abb423d888e1b671dbf9c88u&mid=487408043&platform=pc&upsig=e0be5a6c92095cbeebd24a90cf619a5e&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,mid,platform&mcdnid=50002546&bvc=vod&nettype=0&orderid=0,3&buvid=FF99AEDB-E818-7282-3FC0-8011B43A137555605infoc&build=0&f=u_0_0&agrr=0&bw=38801&logo=A0020000",
]


export class BilibiliVideoDownloader {
    private readonly url: string
    private readonly root: string
    private readonly startChunkIndex: number
    private readonly headers: Record<string, string>
    private readonly chunkSize: number

    constructor(url: string, root: string) {
        this.url = url
        this.root = root

        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
            'Origin': 'https://www.bilibili.com',
            'Referer': 'https://www.bilibili.com/',
        }

        this.chunkSize = 1024 * 512 // 512k
        this.mkdirSync(this.root)
        this.startChunkIndex = this.queryStartChunkIndex()
    }

    // 创建目录，如果已经存在则直接返回
    mkdirSync(path: string) {
        if (fs.existsSync(path)) {
            return
        }
        Deno.mkdirSync(path, {recursive: true})
    }

    queryStartChunkIndex() {
        let startChunkIndex = 0
        for (const dirEntry of Deno.readDirSync(this.root)) {
            startChunkIndex = Math.max(startChunkIndex, parseInt(dirEntry.name))
        }
        return startChunkIndex + 1
    }

    async size() {
        delete this.headers['Range']
        const resp = await head(this.url, {}, this.headers)
        if (resp.headers.get('Content-Type') !== 'video/mp4') {
            throw new Error(`${resp.status}: ${resp.statusText}`)
        }
        return parseInt(resp.headers.get('Content-Length')!)
    }

    async download(start: number, end: number) {
        try {
            const resp = await get(this.url + `&rnd=${Math.random()}`, {}, {
                ...this.headers,
                Range: `bytes=${start}-${end}`
            })
            return await resp.arrayBuffer()
        } catch (_) {
            console.log('timeout')
        }
    }

    save(chunk: Uint8Array, index: number) {
        Deno.writeFileSync(path.join('chunks', pad(index, 3)), chunk)
    }

    combine() {
        let f = ffmpeg()
        for (const dirEntry of Deno.readDirSync(this.root)) {
            f = f.input(path.join(this.root, dirEntry.name))
        }

        f.save('output.mp4')
    }

    async start() {
        const totalBytes = await this.size()
        const totalChunks = Math.ceil(totalBytes / this.chunkSize)

        logger.info('chunks: ', totalChunks)
        logger.info('start: ', this.startChunkIndex)

        let pos = (this.startChunkIndex - 1) * this.chunkSize
        let i = this.startChunkIndex
        while (true) {
            const start = pos
            const end = start + this.chunkSize - 1

            if (start >= totalBytes) {
                break
            }
            logger.info(`${i}/${totalChunks}: bytes=${start}-${end}`)
            const chunk = await this.download(start, end)
            if (chunk) {
                this.save(new Uint8Array(chunk), i)
                pos += this.chunkSize
                i++
            }
        }
    }
}

const downloader = new BilibiliVideoDownloader(urls[0], path.join('chunks'))
await downloader.combine()
