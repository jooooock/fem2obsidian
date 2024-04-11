import {getCourseInfo, downloadCourse} from "./api.ts";


export async function run(courses: string[], dest: string) {
    for (const url of courses) {
        const courseInfo = await getCourseInfo(url)
        await downloadCourse(courseInfo, dest)
    }
}

await run([
    'https://frontendmasters.com/courses/javascript-quiz/',
    'https://frontendmasters.com/courses/web-app-testing/',
], '/Users/champ/ObsidianVaults/FrontendMasters')
