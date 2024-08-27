import ComponentMetadata from "./ComponentMetadata";

export default interface CustomElement extends ComponentMetadata {
    name: string
    content: string,
    attributes: object
}
