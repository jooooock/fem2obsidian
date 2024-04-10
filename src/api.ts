import {get} from "./request/index.ts";
import {CourseDetail} from "./types.d.ts";


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

// https://captions.frontendmasters.com/assets/courses/2024-04-02-web-app-testing/14-testing-a-component-with-storybook.vtt

function getCaptions() {
    get('https://captions.frontendmasters.com/assets/courses/2024-04-02-web-app-testing/14-testing-a-component-with-storybook.vtt')
}
