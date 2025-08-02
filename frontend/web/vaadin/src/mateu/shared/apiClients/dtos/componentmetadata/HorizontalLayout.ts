import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export enum SpacingVariant {
    xs = "xs",
    s = "s",
    m = "m",
    l = "l",
    xl = "xl",
}

export enum HorizontalLayoutJustification {
    START = "START",
    CENTER = "CENTER",
    END = "END",
    BETWEEN = "BETWEEN",
    AROUND = "AROUND",
    EVENLY = "EVENLY",
}

export enum VerticalAlignment {
    STRETCH = "STRETCH",
    START = "START",
    CENTER = "CENTER",
    END = "END",
    BASELINE = "BASELINE",
}

export default interface HorizontalLayout extends ComponentMetadata {

    padding: boolean
    spacing: boolean
    fullWidth: boolean
    flexGrows: number[] | undefined
    wrap: boolean
    spacingVariant: SpacingVariant | undefined
    justification: HorizontalLayoutJustification | undefined
    verticalAlignment: VerticalAlignment | undefined

}
