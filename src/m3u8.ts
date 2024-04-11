import {get} from "./request/index.ts";
import {TsSegment} from "./types.d.ts";
import {AESDecryptor} from "./aes-decryptor.js"
import {cookieManager} from "./request/cookie.ts";

export async function parseM3u8Index(url: string) {
    const m3u8 = await get(url).then(resp => resp.text())
    const lines = m3u8.split('\n')
    const streams = []
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (line.startsWith('#EXT-X-STREAM-INF:')) {
            const matchResult = line.match(/RESOLUTION=(?<resolution>\d+x\d+)/)
            if (matchResult && matchResult.groups) {
                streams.push({
                    url: new URL(lines[i+1], url).toString(),
                    resolution: matchResult.groups['resolution'],
                })
            }
        }
    }
    return streams
}

export async function parseM3u8(url: string) {
    const m3u8 = await get(url).then(resp => resp.text())
    const lines = m3u8.split('\n')
    const segments: TsSegment[] = []
    let hasEncrypted = false
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (line.startsWith('#EXT-X-KEY:')) {
            hasEncrypted = true
            const matchResult = line.match(/METHOD=(?<method>[^,]+),URI="(?<key>[^"]+)",IV=(?<iv>.+)$/)
            if (matchResult && matchResult.groups) {
                segments.push({
                    tsURL: new URL(lines[i+2], url).toString(),
                    method: matchResult.groups['method'],
                    keyURL: new URL(matchResult.groups['key'], url).toString(),
                    iv: new TextEncoder().encode(matchResult.groups['iv']),
                })
            }
        }
    }
    if (!hasEncrypted) {
        // todo: ts 没有加密
    }
    if (segments.length <= 0) {
        console.log(url)
        console.log('m3u8内容为:')
        console.log(m3u8)
        console.log(cookieManager.all())
        console.log(cookieManager.query(url))
        throw new Error('解析 m3u8 失败: ts片段为0')
    }
    return segments
}

// 下载 m3u8 中的 ts 片段
export async function downloadTsSegments(segments: TsSegment[]) {
    // 判断 key 是否一样
    let isSingleKey = false
    let commonKey: ArrayBuffer
    if (new Set(segments.map(s => s.keyURL)).size === 1) {
        console.log('>> using single key')
        commonKey = await get(segments[0].keyURL).then(resp => resp.arrayBuffer())
        isSingleKey = true
    }

    // 并发下载 ts
    const chunks = await new Promise<ArrayBuffer[]>(resolve => {
        let downloadingIndex = 0
        const raws: ArrayBuffer[] = Array.from({length: segments.length})

        const download = async () => {
            const currentIdx = downloadingIndex++
            if (currentIdx >= segments.length) {
                return
            }

            const segment = segments[currentIdx]
            // 下载 ts
            const blob = await get(segment.tsURL).then(resp => resp.arrayBuffer())
            // 下载 key
            let key
            if (isSingleKey) {
                key = commonKey
            } else {
                key = await get(segment.keyURL).then(resp => resp.arrayBuffer())
            }
            // 解密
            raws[currentIdx] = new AESDecryptor(key).decrypt(blob, 0, segment.iv.buffer, true)

            console.log(`>> ${raws.filter(e => e !== undefined).length}/${segments.length}`)

            if (raws.filter(e => e === undefined).length === 0) {
                resolve(raws)
            } else {
                await download()
            }
        }

        for (let i = 0; i < Math.min(segments.length, 10); i++) {
            download()
        }
    })

    const file = new Blob(chunks, {type: 'video/MP2T'})
    return new Uint8Array(await file.arrayBuffer())
}
