import {getCourseInfo, downloadCourse, getLessonSource, downloadM3u8} from "../src/api.ts";
import {downloadTsSegments, parseM3u8, parseM3u8Index} from "../src/m3u8.ts"

const course = await getCourseInfo('https://frontendmasters.com/courses/javascript-quiz/')
await downloadCourse(course, './dist')



// const segments = await parseM3u8('https://stream.frontendmasters.com/2024/02/20/DTFDVKKHhY/FXkbgxMSzZ/index_1080_Q10_7mbps.m3u8')
// const data = await downloadTsSegments(segments, 'test')
// Deno.writeFileSync('test.ts', data)
