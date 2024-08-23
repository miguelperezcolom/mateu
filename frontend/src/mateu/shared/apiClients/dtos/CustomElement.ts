import ViewMetadata from "./ViewMetadata";

export default interface CustomElement extends ViewMetadata {
    name: string
    content: string,
    attributes: object
}
