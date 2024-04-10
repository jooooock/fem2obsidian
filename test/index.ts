import {getCourseInfo} from "../src/api.ts";

const course = await getCourseInfo('web-app-testing')
// console.log(course)
Deno.writeTextFileSync('info.json', JSON.stringify(course, null, 2))
