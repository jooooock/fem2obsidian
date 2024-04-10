import {getCourseInfo, writeTo, getM3u8Source, downloadM3u8} from "../src/api.ts";
import {parseM3u8Index} from "../src/m3u8.ts"

const course = await getCourseInfo('https://frontendmasters.com/courses/javascript-quiz/')
// console.log(course)
//
await writeTo(course, './dist')

// await downloadM3u8('https://stream.frontendmasters.com/2024/02/20/DTFDVKKHhY/oiNhkAmptL/index_720_Q8_5mbps.m3u8')
