import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

/** A point on a {@link Map}. */
export interface MapMarker {
    id: string
    latitude: number
    longitude: number
    label?: string
    description?: string
    /** Pin colour, any CSS colour. */
    color?: string
}

export default interface Map extends ComponentMetadata {

    /** "lat, lon"; with markers and no position, the view fits the markers. */
    position: string
    zoom: string
    markers?: MapMarker[]
    /** Run on a marker click with the marker id in parameters._markerId. */
    markerActionId?: string

}
