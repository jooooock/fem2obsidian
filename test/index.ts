import {getCourseInfo, downloadCourse, parseInfoFromHtml} from "../src/api.ts";
import {path} from "../src/deps.ts"

// const course = await getCourseInfo('https://frontendmasters.com/courses/javascript-quiz/')
// await downloadCourse(course, '/Users/champ/ObsidianVaults/FrontendMasters')

parseInfoFromHtml('javascript-quiz')
