import {getCourseInfo, writeTo, getM3u8Source} from "../src/api.ts";
import {parseM3u8Index} from "../src/m3u8.ts"

const course = await getCourseInfo('https://frontendmasters.com/courses/javascript-quiz/')
// console.log(course)
//
await writeTo(course, './dist')
