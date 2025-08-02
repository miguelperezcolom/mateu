import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import { SpacingVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/HorizontalLayout";

export enum VerticalLayoutJustification {
    START = "START",
    CENTER = "CENTER",
    END = "END",
    BETWEEN = "BETWEEN",
    AROUND = "AROUND",
    EVENLY = "EVENLY",
}

export enum HorizontalAlignment {
    STRETCH = "STRETCH",
    START = "START",
    CENTER = "CENTER",
    END = "END",
    BASELINE = "BASELINE",
}

export default interface VerticalLayout extends ComponentMetadata {

    padding: boolean
    spacing: boolean
    fullWidth: boolean
    flexGrows: number[] | undefined
    wrap: boolean
    spacingVariant: SpacingVariant | undefined
    justification: VerticalLayoutJustification | undefined
    horizontalAlignment: HorizontalAlignment | undefined

}
