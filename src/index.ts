import {Downloader} from "./downloader.ts";


const downloader = new Downloader('/Users/champ/ObsidianVaults/FrontendMasters')

await downloader.add([
    // 'https://frontendmasters.com/courses/javascript-quiz/',
    // 'https://frontendmasters.com/courses/web-app-testing/',
    // 'https://frontendmasters.com/courses/blazingly-fast-js/',
    'https://frontendmasters.com/courses/javascript-cpu-vm/',
    // 'https://frontendmasters.com/courses/web-app-performance/',
    // 'https://frontendmasters.com/courses/web-dev-quiz/',
]).start()
