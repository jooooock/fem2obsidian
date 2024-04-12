import {
    courseDuration,
    lessonNoteName,
    pad,
    parseCourseSlug,
    convertVideo,
    lessonDuration,
    greenText
} from "./utils.ts";
import {downloadResources, getCourseInfo, getVideoSource, parseInfoFromHtml, downloadVTT, downloadM3u8} from "./api.ts";
import {CourseInfo, HtmlInfo, Lesson, VideoResolution} from "./types.d.ts";
import { fs, path } from "./deps.ts";
import {MarkdownWriter} from "./markdown.ts";
import {parseM3u8Index} from "./m3u8.ts";


interface Course {
    slug: string
    data?: CourseInfo & HtmlInfo
    root?: string
}


export class Downloader {
    private readonly dest: string
    private courses: Course[]
    private resolution: VideoResolution

    constructor(dest: string, resolution: VideoResolution = '1080p') {
        this.dest = dest
        this.resolution = resolution
        this.courses = []
    }

    // 添加要下载的课程地址
    add(courseUrl: string | string[]) {
        if (!Array.isArray(courseUrl)) {
            courseUrl = [courseUrl]
        }
        courseUrl.forEach(url => {
            let slug: string | null = url
            if (/https?:\/\//i.test(url)) {
                slug = parseCourseSlug(url)
            }
            if (!slug) {
                throw new Error(`slug解析失败(${url})`)
            }
            this.courses.push({slug: slug})
        })

        return this
    }

    // 拉取课程数据
    async fetchCourseInfo(slug: string): Promise<CourseInfo & HtmlInfo> {
        console.log(`. fetching course data`)

        const data = await getCourseInfo(slug)
        const {topics} = await parseInfoFromHtml(slug)

        return {
            ...data,
            topics,
        }
    }

    // 清空课程的 root 目录
    emptyRoot(root: string) {
        if (fs.existsSync(root)) {
            Deno.removeSync(root, {recursive: true})
        }
        Deno.mkdirSync(root, {recursive: true})
    }


    // 下载课程
    async downloadCourse(course: Course) {
        const root = course.root!
        const courseData = course.data!

        this.emptyRoot(root)

        // 创建 attachments 目录
        Deno.mkdirSync(path.join(root, 'attachments'))

        // 下载附件
        await downloadResources(courseData, root)

        // 创建 _index.md
        this.writeIndexNote(course)
        console.log()

        let sectionDirectory: string
        let index = 1
        for (const item of courseData.lessonElements) {
            if (typeof item === 'string') {
                // 创建章节目录
                const prefix = pad(index++, 2)
                sectionDirectory = path.join(root, `${prefix} - ${item}`)
                Deno.mkdirSync(sectionDirectory)
            } else if (typeof item === 'number') {
                // 创建视频笔记 video.md
                const hash = courseData.lessonHashes[item]
                const lesson = courseData.lessonData[hash]
                await this.writeVideoNote(sectionDirectory!, lesson, course)
            }
        }
    }


    /**
     * 创建 slug.md 索引笔记
     * @param course
     */
    writeIndexNote(course: Course) {
        console.log(`. creating index note`)

        const courseData = course.data!
        const writer = new MarkdownWriter()

        // Frontmatter
        const frontmatter = {
            title: courseData.title,
            url: `https://frontendmasters.com/courses/${course.slug}/`,
            slug: course.slug,
            tags: courseData.topics,
            author: courseData.instructors.map(instructor => instructor.name),
            duration: courseDuration(courseData),
            published: courseData.datePublished,
            isTrial: courseData.isTrial,
            hasHLS: courseData.hasHLS,
            hasTranscript: courseData.hasTranscript,
            hasWebVTT: courseData.hasWebVTT,
            hasIntroLoop: courseData.hasIntroLoop,
        }
        writer.writeFrontMatter(frontmatter)

        // Logo
        writer.writeLine('## Logo', 1)
        writer.writeLine(`![200](${courseData.thumbnail})`, 1)

        // Description
        writer.writeLine('## Description', 1)
        writer.writeLine(courseData.description, 1)

        // Slides
        const slidesResources = courseData.resources.filter(resource => resource.url.endsWith('.pdf') || /slides/i.test(resource.label))
        if (slidesResources.length > 0) {
            writer.writeLine('## Slides', 1)
            slidesResources.forEach(resource => {
                writer.writeLine(`![[attachments/${path.basename(resource.url)}|${resource.label}]]`, 1)
            })
        }

        // Github
        const githubResources = courseData.resources.filter(resource => /github/i.test(resource.label))
        if (githubResources.length > 0) {
            writer.writeLine('## Github', 1)
            slidesResources.forEach(resource => {
                writer.writeLine(`![${resource.label}](${resource.url})`, 1)
            })
        }

        writer.writeLine('## Table of Contents')
        let sectionIndex = 0
        let sectionTitle: string
        courseData.lessonElements.forEach(item => {
            if (typeof item === 'string') {
                sectionTitle = item
                sectionIndex++
                writer.writeLine(`\n### ${item}`, 1)
            } else {
                const hash = courseData.lessonHashes[item]
                const lesson = courseData.lessonData[hash]
                writer.writeLine(`[[${pad(sectionIndex, 2)} - ${sectionTitle}/${pad(lesson.index + 1, 2)} - ${lesson.slug}|${pad(lesson.index + 1, 2)} - ${lesson.title}]]`)
            }
        })

        Deno.writeTextFileSync(path.join(course.root!, `${course.slug}.md`), writer.toString())
    }


    /**
     * 创建视频笔记
     * @param sectionDirectory
     * @param lesson
     * @param course
     */
    async writeVideoNote(sectionDirectory: string, lesson: Lesson, course: Course) {
        console.log(`. [${greenText(lessonNoteName(lesson))}]`)

        const root = course.root!

        // 下载字幕文件
        console.log(`..  downloading vtt`)
        await downloadVTT(lesson, course.data!, root)

        // 下载视频文件
        console.log(`..  fetching m3u8 source`)
        const m3u8IndexURL = await getVideoSource(lesson.hash)
        if (!m3u8IndexURL) {
            console.log(lesson)
            throw new Error('获取视频的 m3u8 数据失败')
        }

        const m3u8Streams = await parseM3u8Index(m3u8IndexURL)
        if (m3u8Streams.length <= 0) {
            console.log(lesson)
            throw new Error('该视频的 m3u8 视频流列表为空')
        }

        const targetStream = m3u8Streams.find(s => s.p === this.resolution.replace(/p$/, ''))
        if (!targetStream) {
            console.log(`指定分辨率(${this.resolution})的视频不存在`)
            return
        }

        console.log(`..  downloading video`)
        const videoPath = await downloadM3u8(targetStream.url, lesson, root)

        // 将 ts 视频转为 mp4 视频
        console.log(`..  converting ts to mp4`)
        await convertVideo(videoPath)


        // 开始输出 md 笔记
        const writer = new MarkdownWriter()

        // 写入 frontmatter
        const frontmatter: Record<string, string | number> = {
            title: lesson.title,
            hash: lesson.hash,
            timestamp: lesson.timestamp,
            duration: lessonDuration(lesson.timestamp),
            annotations: lesson.annotations ? lesson.annotations.length : 0
        }
        writer.writeFrontMatter(frontmatter)

        // 写入 description
        writer.writeLine('## Description', 1)
        writer.writeLine(lesson.description)

        // 写入 description 的中文翻译
        writer.writeBlockquote('中文翻译')

        // 写入视频
        writer.writeLine('## Video', 1)
        writer.writeLine(`![[../attachments/${pad(lesson.index + 1, 2)}-${lesson.slug}.mp4]]`, 2)

        // 写入 annotations
        if (lesson.annotations) {
            writer.writeLine('## Annotations', 1)
            lesson.annotations.forEach(annotation => {
                writer.writeLine(`- ${annotation.message}`)
            })
        }

        writer.writeBlankLine(2)


        Deno.writeTextFileSync(path.join(sectionDirectory, lessonNoteName(lesson)), writer.toString())
    }


    /**
     * 开始下载
     */
    async start() {
        for (const course of this.courses) {
            console.log(`[${greenText(course.slug, true)}]`)

            const data = await this.fetchCourseInfo(course.slug)
            course.data = data
            course.root = path.join(this.dest, data.title)

            await this.downloadCourse(course)
        }
    }
}
