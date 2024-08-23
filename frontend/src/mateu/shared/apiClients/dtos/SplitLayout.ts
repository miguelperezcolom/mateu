import ViewMetadata from "./ViewMetadata";
import Component from "./Component";

export default interface SplitLayout extends ViewMetadata {
    left: Component
    right: Component
}
