import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface CarouselLayout extends ComponentMetadata {

    alt: boolean // Flips the position of the navigation. Puts the navigation at the top of the carousel
    // for the horizontal layout and to the left for the vertical layout.
    animating: boolean // (boolean) - Read-only value that indicates if the carousel is been animated
    // (Transition).
    auto: boolean // (boolean) - Change slides automatically.
    direction: string // (string) - Carousel direction (horizontal or vertical).
    disabled: boolean // (boolean) - Disables component.
    disableSwipe: boolean // disable-swipe (boolean) - Disables swipe functionality.
    disableKeys: boolean //    disable-keys (boolean) - Disables keyboard navigation.
    duration: number // (number) - Autoplay interval time in milliseconds (Default: 4000)
    dots: boolean // (boolean) - Show navigation dots.
    end: boolean // (boolean) - Detail returns true when the carousel has reached the last slide.
    loop: boolean // (boolean) - Determines if the carousel should be looped. This affects the controls
    // and the drag and drop functionality. Set to true if you need to loop the slides.
    nav: boolean // (boolean) - Show navigation next/prev buttons.
    selected: number // (number) - Selected slide (Starts at 0)
    total: number // (number) - Read-only value that reflects the total number of slides.


}
