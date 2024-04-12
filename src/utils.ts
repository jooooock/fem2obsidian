import {ffmpeg, colors} from "./deps.ts";
import type {ConvertProgress} from "./types.d.ts";
import {CourseInfo, Lesson} from "./types.d.ts";


export function pad(value: string | number, len: number, char = '0') {
    value = value.toString()
    if (value.length < len) {
        return char.repeat(len - value.length) + value
    }
    return value
}

/**
 * 解析url中的slug
 * @param url
 */
export function parseCourseSlug(url: string) {
    const slugRe = /^https:\/\/frontendmasters.com\/courses\/(?<slug>[^/]+)\//
    const matchResult = url.match(slugRe)
    if (!matchResult || !matchResult.groups) {
        return null
    }
    return matchResult.groups.slug
}

export function lessonNoteName(lesson: Lesson) {
    const prefix = pad(lesson.index + 1, 2)
    return `${prefix} - ${lesson.slug}.md`
}

export function courseDuration(course: CourseInfo) {
    const lastLessonHash = course.lessonHashes.at(-1)!
    const lastLessonTimestamp = course.lessonData[lastLessonHash].timestamp
    return lastLessonTimestamp.split('-')[1].trim()
}

export function lessonDuration(timestamp: string) {
    const [start, end] = timestamp.split(' - ')
    const [s1, s2, s3] = start.split(':').map(_ => parseInt(_))
    let [e1, e2, e3] = end.split(':').map(_ => parseInt(_))
    if (e3 < s3) {
        if (e2 > 0) {
            e2--
            e3 += 60
        } else {
            e1--
            e2 = 59
            e3 += 60
        }
    }
    if (e2 < s2) {
        e1--
        e2 += 60
    }
    return `${pad(e1 - s1, 2)}:${pad(e2 - s2, 2)}:${pad(e3 - s3, 2)}`
}

export function convertVideo(input: string): Promise<void> {
    console.log(`..  converting ts to mp4`)
    const outputFile = input.replace(/\.ts$/, '.mp4')
    return new Promise((resolve) => {
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
            .on('progress', (_progress: ConvertProgress) => {
                // console.log('progress', _progress.percent)
            })
            .on('end', (_: string, _output: string) => {
                // console.log('end', output)
                console.log()
                resolve()
                // 删除原视频
                Deno.removeSync(input)
            })
            .save(outputFile)
    })
}

export function greenText(text: string, strong = false) {
    const t = strong ? colors.bold(text) : text
    return colors.green(t)
}

export function blueText(text: string | number, strong = true) {
    const t = strong ? colors.bold(text.toString()) : text.toString()
    return colors.blue(t)
}
