export class MarkdownWriter {
    private content: string;

    constructor() {
        this.content = ''
    }

    writeFrontMatter(frontmatter: Record<string, string>) {
        this.writeLine('---')
        Object.keys(frontmatter).forEach(key => {
            this.writeLine(`${key}: ${frontmatter[key]}`)
        })
        this.writeLine('---')
    }
    writeLine(line: string) {
        this.content += line + '\n'
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
