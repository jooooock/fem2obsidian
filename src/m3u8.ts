import {get} from "./request/index.ts";

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
