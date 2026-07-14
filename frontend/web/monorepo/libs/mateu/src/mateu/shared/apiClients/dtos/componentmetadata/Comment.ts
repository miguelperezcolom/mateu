export default interface Comment {
    id?: string
    author?: string
    avatar?: string
    text?: string
    timestamp?: string
    replies?: Comment[]
}
