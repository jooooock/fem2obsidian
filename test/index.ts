import logger from "../src/logger.ts";
import {colors} from "../src/deps.ts"
import {greenText} from "../src/utils.ts";


console.log(colors.green(colors.bold("123")))
console.log(colors.green("123"))
console.log(colors.brightGreen("123"))

console.log(`this is ${greenText("123", true)} h`)
