export function isString(content: unknown): content is string {
    return (typeof (content) === 'string' || content instanceof String)
}

export function isArray(content: unknown): content is Array<unknown> {
    return content instanceof Array || Array.isArray(content)
}