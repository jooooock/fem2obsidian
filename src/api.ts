import {get} from "./request/index.ts";
import {CourseDetail, Lesson} from "./types.d.ts";
import {fs, path} from './deps.ts'
import {pad} from "./utils.ts";
import {parseM3u8Index, parseM3u8, downloadTsSegments} from "./m3u8.ts"


// 获取课程信息
export async function getCourseInfo(url: string): Promise<CourseDetail> {
    let slug: string | null = url
    if (url.startsWith('http')) {
        slug = parseSlug(url)
    }
    if (!slug) {
        throw new Error(`slug解析失败(${url})`)
    }

    return await get(`https://api.frontendmasters.com/v1/kabuki/courses/${slug}`).then(resp => resp.json())
}

function parseSlug(url: string) {
    const slugRe = /^https:\/\/frontendmasters.com\/courses\/(?<slug>[^/]+)\//
    const matchResult = url.match(slugRe)
    if (!matchResult || !matchResult.groups) {
        return null
    }
    return matchResult.groups.slug
}



// 写入指定位置
export async function writeTo(course: CourseDetail, dest: string) {
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
            const prefix = pad(lesson.index+1, 2)
            Deno.writeTextFileSync(path.join(currentDirectory!, `${prefix} - ${lesson.slug}.md`), await noteContent(lesson, course, root))
        }
    }
}

// 生成笔记内容
async function noteContent(lesson: Lesson, course: CourseDetail, root: string) {
    console.log(`${lesson.index}: ${lesson.title}`)
    const m3u8IndexURL = await getM3u8Source(lesson)
    if (!m3u8IndexURL) {
        console.log(lesson)
        throw new Error('获取视频的 m3u8 数据失败')
    }

    const m3u8Streams = await parseM3u8Index(m3u8IndexURL)
    if (m3u8Streams.length <= 0) {
        console.log(lesson)
        throw new Error('该视频的 m3u8 列表为空')
    }

    // 下载字幕文件
    await downloadVTT(lesson, course, root)
    // 下载视频文件
    await downloadM3u8(m3u8Streams[2].url, lesson, root)

    let md = ''

    // 写入 frontmatter
    md += '---\n'
    md += `m3u8: ${m3u8Streams[2].url}\n`
    md += '---\n'

    // 写入 description
    md += lesson.description + '\n'

    // 写入 description 的中文翻译
    md += '\n> ' + '中文翻译\n\n'

    // 写入视频
    md += `![[../attachments/${pad(lesson.index+1, 2)}-${lesson.slug}.mp4]]\n\n`

    // 写入所有 m3u8 资源
    md += '## 更多m3u8资源\n'
    md += `\`\`\`txt
${m3u8Streams.map(_ => `${_.resolution}: ${_.url}`).join('\n')}
\`\`\`\n`
    md += '\n\n'

    return md
}

export async function getM3u8Source(lesson: Lesson): Promise<string | null> {
    const resp = await get(`https://api.frontendmasters.com/v1/kabuki/video/${lesson.hash}/source`, {
        f: 'm3u8'
    }).then(resp => resp.json())
    if (resp && typeof resp === 'object' && 'url' in resp) {
        return resp.url
    }
    return null
}

// 下载 vtt 文件，并保存在 attachments 目录下
export async function downloadVTT(lesson: Lesson, course: CourseDetail, root: string) {
    const url = `https://captions.frontendmasters.com/assets/courses/${course.datePublished}-${course.slug}/${lesson.index}-${lesson.slug}.vtt`
    const vtt = await get(url).then(resp => resp.text())
    const filepath = path.join(root, `attachments/${pad(lesson.index+1, 2)}-${lesson.slug}.en.vtt`)
    Deno.writeTextFileSync(filepath, vtt)
}

// 下载 m3u8 文件，转为 mp4，并保存在 attachments 目录下
export async function downloadM3u8(m3u8Url: string, lesson: Lesson, root: string) {
    console.log(`downloading ${lesson.slug}`)
    const segments = await parseM3u8(m3u8Url)
    const data = await downloadTsSegments(segments, lesson.slug)
    const filepath = path.join(root, `attachments/${pad(lesson.index+1, 2)}-${lesson.slug}.ts`)
    Deno.writeFileSync(filepath, data)
}
