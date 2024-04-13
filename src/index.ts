import {Downloader} from "./downloader.ts";


const downloader = new Downloader('/Users/champ/ObsidianVaults/FrontendMasters')

await downloader.add([
    // 'https://frontendmasters.com/courses/javascript-quiz/',
    // 'https://frontendmasters.com/courses/javascript-cpu-vm/',
    // 'https://frontendmasters.com/courses/blazingly-fast-js/',
    // 'https://frontendmasters.com/courses/web-app-performance/',
    // 'https://frontendmasters.com/courses/web-dev-quiz/',
    'https://frontendmasters.com/courses/device-web-apis/',
    // 'https://frontendmasters.com/courses/vanilla-js-apps/',
    // 'https://frontendmasters.com/courses/web-storage-apis/',
    // 'https://frontendmasters.com/courses/web-auth-apis/',
    // 'https://frontendmasters.com/courses/background-javascript/',
    // 'https://frontendmasters.com/courses/sql/',
    // 'https://frontendmasters.com/courses/css-animations/',
    // 'https://frontendmasters.com/courses/swift-ios/',
    // 'https://frontendmasters.com/courses/web-components/',
    // 'https://frontendmasters.com/courses/pwas/',
    // 'https://frontendmasters.com/courses/xstate-v2/',
    // 'https://frontendmasters.com/courses/web-audio/',
    // 'https://frontendmasters.com/courses/css-variables/',
    // 'https://frontendmasters.com/courses/css-grid-flexbox-v2/',
    // 'https://frontendmasters.com/courses/web-perf/',
    // 'https://frontendmasters.com/courses/javascript-hard-parts-v2/',
    // 'https://frontendmasters.com/courses/service-workers/',
    // 'https://frontendmasters.com/courses/git-in-depth/',
    // 'https://frontendmasters.com/courses/linting-asts/',
]).start()
