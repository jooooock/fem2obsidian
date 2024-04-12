interface CourseResource {
    label: string
    url: string
}

interface CourseInstructor {
    slug: string
    name: string
    tagLine: string
    bio: string
    imageURL: string
    socialSettings: Record<string, string>
}

interface LessonAnnotation {
    id: string
    lessonHash: string
    range: [number, number]
    message: string
}

interface Lesson {
    slug: string
    title: string
    description: string
    thumbnail: string
    index: number
    elementIndex: number
    statsId: string
    hash: string
    timestamp: string
    annotations?: LessonAnnotation[]
}

export interface CourseInfo {
    slug: string
    title: string
    description: string
    thumbnail: string
    resources: CourseResource[]
    instructors: CourseInstructor[]
    lessonSlugs: string[]
    lessonData: Record<string, Lesson>
    lessonElements: (string | number)[]
    lessonHashes: string[]
    isTrial: boolean
    hasHLS: boolean
    hasTranscript: boolean
    hasIntroLoop: boolean
    hasWebVTT: boolean
    datePublished: string
}

export interface TsSegment {
    tsURL: string
    method: string
    keyURL: string
    iv: Uint8Array
}

export interface HtmlInfo {
    topics: string[]
}

export interface ConvertProgress {
    frames: number
    currentFps: number
    currentKbps: number
    targetSize: number
    timemark: string
    percent: number
}

export type VideoResolution = '2160p' | '1440p' | '1080p' | '720p' | '360p'
