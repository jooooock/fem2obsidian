export class MarkdownWriter {
    private content: string;

    constructor() {
        this.content = ''
    }

    writeFrontMatter(frontmatter: Record<string, string | number | boolean | string[]>) {
        this.writeLine('---')
        Object.keys(frontmatter).forEach(key => {
            const value = frontmatter[key]
            if (Array.isArray(value)) {
                this.writeLine(`${key}:`)
                value.forEach(v => {
                    this.writeLine(`  - ${v}`)
                })
            } else {
                this.writeLine(`${key}: ${value}`)
            }
        })
        this.writeLine('---')
    }
    writeLine(line: string, blankCount = 0) {
        this.content += line + '\n' + '\n'.repeat(blankCount)
    }
    writeBlockquote(content: string) {
        this.writeBlankLine()
        this.writeLine(`> ${content}`)
        this.writeBlankLine()
    }
    writeBlankLine(count = 1) {
        this.content += '\n'.repeat(count)
    }

    toString() {
        return this.content
    }
}
