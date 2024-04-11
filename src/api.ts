import {get} from "./request/index.ts"
import {CourseInfo, HtmlInfo, Lesson} from "./types.d.ts"
import {fs, path, DOMParser} from './deps.ts'
import {pad} from "./utils.ts"
import {parseM3u8Index, parseM3u8, downloadTsSegments} from "./m3u8.ts"
import {MarkdownWriter} from "./markdown.ts"
import {cookieManager} from "./request/cookie.ts";


/**
 * 获取课程信息
 * @param url 课程url或slug
 */
export async function getCourseInfo(url: string): Promise<CourseInfo> {
    let slug: string | null = url
    if (url.startsWith('http')) {
        slug = parseSlug(url)
    }
    if (!slug) {
        throw new Error(`slug解析失败(${url})`)
    }

    console.log(`fetching course info for [${slug}]`)
    return await get(`https://api.frontendmasters.com/v1/kabuki/courses/${slug}`).then(resp => resp.json())
}

/**
 * 解析url中的slug
 * @param url
 */
function parseSlug(url: string) {
    const slugRe = /^https:\/\/frontendmasters.com\/courses\/(?<slug>[^/]+)\//
    const matchResult = url.match(slugRe)
    if (!matchResult || !matchResult.groups) {
        return null
    }
    return matchResult.groups.slug
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
 * 下载课程信息
 * @param course 课程信息
 * @param dest 写入位置
 */
export async function downloadCourse(course: CourseInfo, dest: string) {
    const root = path.join(dest, course.title)
    if (fs.existsSync(root)) {
        Deno.removeSync(root, {recursive: true})
    }
    Deno.mkdirSync(root, {recursive: true})

    // 创建 attachments 目录
    Deno.mkdirSync(path.join(root, 'attachments'))

    // 下载附件
    await downloadResources(course, root)

    // 创建 _index.md
    Deno.writeTextFileSync(path.join(root, '_index.md'), await makeIndexNote(course))

    let currentDirectory
    let index = 1
    for (const item of course.lessonElements) {
        if (typeof item === 'string') {
            // 创建章节目录
            const prefix = pad(index++, 2)
            currentDirectory = path.join(root, `${prefix} - ${item}`)
            Deno.mkdirSync(currentDirectory)
        } else if (typeof item === 'number') {
            // 创建课程笔记
            const hash = course.lessonHashes[item]
            const lesson = course.lessonData[hash]
            Deno.writeTextFileSync(path.join(currentDirectory!, lessonNoteName(lesson)), await makeNoteContent(lesson, course, root))
        }
    }
}

function lessonNoteName(lesson: Lesson) {
    const prefix = pad(lesson.index + 1, 2)
    return `${prefix} - ${lesson.slug}.md`
}

function courseDuration(course: CourseInfo) {
    const lastLessonHash = course.lessonHashes.at(-1)!
    const lastLessonTimestamp = course.lessonData[lastLessonHash].timestamp
    return lastLessonTimestamp.split('-')[1].trim()
}

function lessonDuration(timestamp: string) {
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


/**
 * 生成索引文件内容
 * @param course
 */
async function makeIndexNote(course: CourseInfo) {
    console.log(`\ncreating index note`)

    const writer = new MarkdownWriter()

    const {topics} = await parseInfoFromHtml(course.slug)

    // Frontmatter
    const frontmatter = {
        title: course.title,
        tags: topics,
        author: course.instructors.map(instructor => instructor.name),
        duration: courseDuration(course),
        published: course.datePublished,
        isTrial: course.isTrial,
        hasHLS: course.hasHLS,
        hasTranscript: course.hasTranscript,
        hasWebVTT: course.hasWebVTT,
        hasIntroLoop: course.hasIntroLoop,
    }
    writer.writeFrontMatter(frontmatter)

    // Logo
    writer.writeLine('## Logo', 1)
    writer.writeLine(`![200](${course.thumbnail})`, 1)

    // Description
    writer.writeLine('## Description', 1)
    writer.writeLine(course.description, 1)

    // Slides
    const pdfResources = course.resources.filter(resource => resource.url.endsWith('.pdf'))
    if (pdfResources.length > 0) {
        writer.writeLine('## Slides', 1)
        pdfResources.forEach(resource => {
            writer.writeLine(`![[attachments/${path.basename(resource.url)}]]`, 1)
        })
    }

    writer.writeLine('## Table of Contents')
    let sectionIndex = 0
    let sectionTitle: string
    course.lessonElements.forEach(item => {
        if (typeof item === 'string') {
            sectionTitle = item
            sectionIndex++
            writer.writeLine(`\n### ${item}`, 1)
        } else {
            const hash = course.lessonHashes[item]
            const lesson = course.lessonData[hash]
            writer.writeLine(`[[${pad(sectionIndex, 2)} - ${sectionTitle}/${pad(lesson.index + 1, 2)} - ${lesson.slug}|${pad(lesson.index + 1, 2)} - ${lesson.title}]]`)
        }
    })


    return writer.toString()
}

/**
 * 生成笔记内容
 * @param lesson 小节信息
 * @param course 课程信息
 * @param root 课程根目录
 */
async function makeNoteContent(lesson: Lesson, course: CourseInfo, root: string) {
    console.log(`\ncreating note for [${lessonNoteName(lesson)}]`)
    const m3u8IndexURL = await getLessonSource(lesson.hash)
    if (!m3u8IndexURL) {
        console.log(lesson)
        throw new Error('获取视频的 m3u8 数据失败')
    }

    const m3u8Streams = await parseM3u8Index(m3u8IndexURL)
    if (m3u8Streams.length <= 0) {
        console.log(lesson)
        throw new Error('该视频的 m3u8 视频流列表为空')
    }

    // 默认下载视频的分辨率
    // 0: 3840x2160
    // 1: 2560x1440
    // 2: 1920x1080
    // 3: 1280x720
    // 4: 640x360
    const defaultResolution = 4

    // 下载字幕文件
    await downloadVTT(lesson, course, root)
    // 下载视频文件
    await downloadM3u8(m3u8Streams[defaultResolution].url, lesson, root)

    const writer = new MarkdownWriter()

    // 写入 frontmatter
    const frontmatter: Record<string, string> = {}
    m3u8Streams.forEach(stream => {
        frontmatter[stream.resolution] = stream.url
    })
    Object.assign(frontmatter, {
        m3u8: m3u8Streams[defaultResolution].url,
        hash: lesson.hash,
        timestamp: lesson.timestamp,
        duration: lessonDuration(lesson.timestamp),
    })

    writer.writeFrontMatter(frontmatter)

    // 写入 description
    writer.writeLine(lesson.description)

    // 写入 description 的中文翻译
    writer.writeBlockquote('中文翻译')

    // 写入视频
    writer.writeLine(`![[../attachments/${pad(lesson.index + 1, 2)}-${lesson.slug}.mp4]]`, 2)

    // 写入 annotations
    if (lesson.annotations) {
        writer.writeLine('## Annotations', 1)
        lesson.annotations.forEach(annotation => {
            writer.writeLine(`- ${annotation.message}`)
        })
    }

    writer.writeBlankLine(2)

    return writer.toString()
}


export async function getLessonSource(hash: string): Promise<string | null> {
    console.log(`> fetching m3u8 index file`)
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

// 下载 vtt 文件，并保存在 attachments 目录下
export async function downloadVTT(lesson: Lesson, course: CourseInfo, root: string) {
    console.log(`> downloading vtt`)
    const url = `https://captions.frontendmasters.com/assets/courses/${course.datePublished}-${course.slug}/${lesson.index}-${lesson.slug}.vtt`
    const vtt = await get(url).then(resp => resp.text())
    const filepath = path.join(root, `attachments/${pad(lesson.index + 1, 2)}-${lesson.slug}.en.vtt`)
    Deno.writeTextFileSync(filepath, vtt)
}

// 下载 m3u8 文件，转为 mp4，并保存在 attachments 目录下
export async function downloadM3u8(m3u8Url: string, lesson: Lesson, root: string) {
    console.log(`> downloading video`)
    const segments = await parseM3u8(m3u8Url)
    const data = await downloadTsSegments(segments)
    const filepath = path.join(root, `attachments/${pad(lesson.index + 1, 2)}-${lesson.slug}.ts`)
    Deno.writeFileSync(filepath, data)
}

// 下载课程附件资源
async function downloadResources(course: CourseInfo, root: string) {
    for (let i = 0; i < course.resources.length; i++) {
        const resource = course.resources[i]
        if (resource.url.endsWith('.pdf')) {
            const filename = path.basename(resource.url)
            console.log(`> downloading resource [${filename}]`)
            const data = await get(resource.url).then(resp => resp.arrayBuffer())
            Deno.writeFileSync(path.join(root, `attachments/${filename}`), new Uint8Array(data))
        }
    }
}
