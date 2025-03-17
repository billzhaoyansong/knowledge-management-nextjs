export function isString(content: any): boolean {
    return (typeof (content) === 'string' || content instanceof String)
}

export function isArray(content: any): boolean {
    return content instanceof Array || Array.isArray(content)
}