export function pad(value: string | number, len: number, char = '0') {
    value = value.toString()
    if (value.length < len) {
        return char.repeat(len - value.length) + value
    }
    return value
}
