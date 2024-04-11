import {ffmpeg} from "./deps.ts";
import type {ConvertProgress} from "./types.d.ts";


export function pad(value: string | number, len: number, char = '0') {
    value = value.toString()
    if (value.length < len) {
        return char.repeat(len - value.length) + value
    }
    return value
}

export function convertVideo(input: string): Promise<void> {
    const outputFile = input.replace(/\.ts$/, '.mp4')
    return new Promise((resolve) => {
        console.log(`> converting video to mp4`)
        ffmpeg(input)
            .outputOptions([
                '-c copy',
                '-map 0:v',
                '-map 0:a',
                '-bsf:a aac_adtstoasc'
            ])
            .on('start', (_cmd: string) => {
                // console.log('start', cmd)
            })
            .on('progress', (progress: ConvertProgress) => {
                console.log('progress', progress.percent)
            })
            .on('end', (_: string, _output: string) => {
                // console.log('end', output)
                resolve()
                // 删除原视频
                Deno.removeSync(input)
            })
            .save(outputFile)
    })
}
