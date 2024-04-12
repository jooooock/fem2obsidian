import {get} from "./request/index.ts"
import {CourseInfo, HtmlInfo, Lesson} from "./types.d.ts"
import {fs, path, DOMParser} from './deps.ts'
import {greenText, pad} from "./utils.ts"
import {parseM3u8TsSegments, downloadTsSegments} from "./m3u8.ts"
import {cookieManager} from "./request/cookie.ts"
import logger from "./logger.ts"




/**
 * 获取课程信息
 * @param slug 课程url或slug
 */
export async function getCourseInfo(slug: string): Promise<CourseInfo> {
    return await get(`https://api.frontendmasters.com/v1/kabuki/courses/${slug}`).then(resp => resp.json())
}


/**
 * 从 html 中解析额外的数据
 * @param slug
 */
export async function parseInfoFromHtml(slug: string): Promise<HtmlInfo> {
    const html = await get(`https://frontendmasters.com/courses/${slug}/`).then(resp => resp.text())
    const document = new DOMParser().parseFromString(html, 'text/html')
    const topics: string[] = document.querySelectorAll('#main-content > .MediaHeader .CourseCollectionsList span:contains("Topics:") + ul > li').map(li => li.textContent)

    return {
        topics,
    }
}


/**
 * 获取视频的 m3u8 索引文件地址
 * @param hash
 */
export async function getVideoSource(hash: string): Promise<string | null> {
    console.log(`..  fetching m3u8 source`)
    const resp = await get(`https://api.frontendmasters.com/v1/kabuki/video/${hash}/source`, {
        f: 'm3u8'
    })

    // 设置 cookie
    resp.headers.getSetCookie().forEach(str => {
        const cookie = cookieManager.parse(str, 'https://api.frontendmasters.com/v1/kabuki/video')
        if (cookie) {
            cookieManager.set(cookie)
        }
    })

    const json = await resp.json()
    if (json && typeof json === 'object' && 'url' in json) {
        return json.url as string
    }
    return null
}


/**
 * 下载 vtt 文件，并保存在 attachments 目录下
 * @param lesson
 * @param course
 * @param root
 */
export async function downloadVTT(lesson: Lesson, course: CourseInfo, root: string) {
    const filepath = path.join(root, `attachments/${pad(lesson.index + 1, 2)}-${lesson.slug}.en.vtt`)
    if (fs.existsSync(filepath)) {
        return
    }

    console.log(`..  downloading vtt`)
    const url = `https://captions.frontendmasters.com/assets/courses/${course.datePublished}-${course.slug}/${lesson.index}-${lesson.slug}.vtt`
    const vtt = await get(url).then(resp => resp.text())
    Deno.writeTextFileSync(filepath, vtt)
}


/**
 * 下载视频文件(ts格式)，并保存在 attachments 目录下
 * @param m3u8Url
 * @param lesson
 * @param root
 */
export async function downloadM3u8(m3u8Url: string, lesson: Lesson, root: string) {
    const filepath = path.join(root, `attachments/${pad(lesson.index + 1, 2)}-${lesson.slug}.ts`)
    if (fs.existsSync(filepath)) {
        return
    }

    console.log(`..  downloading video`)
    const segments = await parseM3u8TsSegments(m3u8Url)
    const data = await downloadTsSegments(segments)
    Deno.writeFileSync(filepath, data)
    return filepath
}


/**
 * 下载课程附件资源，并保存在 attachments 目录下
 * @param course
 * @param root
 */
export async function downloadResources(course: CourseInfo, root: string) {
    for (let i = 0; i < course.resources.length; i++) {
        const resource = course.resources[i]
        if (resource.url.endsWith('.pdf')) {
            const filename = path.basename(resource.url)
            const filepath = path.join(root, `attachments/${filename}`)
            if (fs.existsSync(filepath)) {
                continue
            }

            console.log(`. downloading resource [${greenText(filename)}]`)
            await get(resource.url).then(resp => resp.arrayBuffer()).then(data => {
                Deno.writeFileSync(filepath, new Uint8Array(data))
            }).catch(e => {
                logger.error("download resource file failed", {course: course.slug, resource: resource}, e)
            })
        }
    }
}
