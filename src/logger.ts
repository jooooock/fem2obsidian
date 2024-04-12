import {Logger} from "./deps.ts";


const logger = new Logger()
await logger.initFileLogger('log')

logger.disableConsole()

export default logger
