import {get} from "./request/index.ts"
import {CourseInfo, Lesson} from "./types.d.ts"
import {fs, path} from './deps.ts'
import {pad} from "./utils.ts"
import {parseM3u8Index, parseM3u8, downloadTsSegments} from "./m3u8.ts"
import {MarkdownWriter} from "./markdown.ts"


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

    // 创建 _index.md
    Deno.writeTextFileSync(path.join(root, '_index.md'), '')

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

/**
 * 生成笔记内容
 * @param lesson 小节信息
 * @param course 课程信息
 * @param root 课程根目录
 */
async function makeNoteContent(lesson: Lesson, course: CourseInfo, root: string) {
    console.log(`\ncreating note for [${lessonNoteName(lesson)}]`)
    const m3u8IndexURL = await getLessonSource(lesson)
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
    const defaultResolution = 0

    // 下载字幕文件
    await downloadVTT(lesson, course, root)
    // 下载视频文件
    await downloadM3u8(m3u8Streams[defaultResolution].url, lesson, root)

    const mdWriter = new MarkdownWriter()

    // 写入 frontmatter
    const frontmatter: Record<string, string> = {}
    m3u8Streams.forEach(stream => {
        frontmatter[stream.resolution] = stream.url
    })
    frontmatter['m3u8'] = m3u8Streams[defaultResolution].url
    mdWriter.writeFrontMatter(frontmatter)

    // 写入 description
    mdWriter.writeLine(lesson.description)

    // 写入 description 的中文翻译
    mdWriter.writeBlockquote('中文翻译')

    // 写入视频
    mdWriter.writeLine(`![[../attachments/${pad(lesson.index + 1, 2)}-${lesson.slug}.mp4]]`)
    mdWriter.writeBlankLine(2)

    return mdWriter.toString()
}

export async function getLessonSource(lesson: Lesson): Promise<string | null> {
    console.log(`> fetching m3u8 index`)
    const resp = await get(`https://api.frontendmasters.com/v1/kabuki/video/${lesson.hash}/source`, {
        f: 'm3u8'
    }).then(resp => resp.json())
    if (resp && typeof resp === 'object' && 'url' in resp) {
        return resp.url
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
