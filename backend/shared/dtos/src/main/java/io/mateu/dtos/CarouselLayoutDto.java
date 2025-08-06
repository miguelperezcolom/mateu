package io.mateu.dtos;

import java.awt.*;
import lombok.Builder;

/**
 * Metadata for a horizontal layout. Child componentIds are in the HorizontalLayout component itself
 */
@Builder
public record CarouselLayoutDto(
    boolean
        alt, // Flips the position of the navigation. Puts the navigation at the top of the carousel
    // for the horizontal layout and to the left for the vertical layout.
    boolean
        animating, // (boolean) - Read-only value that indicates if the carousel is been animated
    // (Transition).
    boolean auto, // (boolean) - Change slides automatically.
    OrientationDto direction, // (string) - Carousel direction (horizontal or vertical).
    boolean disabled, // (boolean) - Disables component.
    boolean disableSwipe, // disable-swipe (boolean) - Disables swipe functionality.
    boolean disableKeys, //    disable-keys (boolean) - Disables keyboard navigation.
    int duration, // (number) - Autoplay interval time in milliseconds (Default: 4000)
    boolean dots, // (boolean) - Show navigation dots.
    boolean end, // (boolean) - Detail returns true when the carousel has reached the last slide.
    boolean
        loop, // (boolean) - Determines if the carousel should be looped. This affects the controls
    // and the drag and drop functionality. Set to true if you need to loop the slides.
    boolean nav, // (boolean) - Show navigation next/prev buttons.
    int selected, // (number) - Selected slide (Starts at 0)
    int total // (number) - Read-only value that reflects the total number of slides.
    ) implements ComponentMetadataDto {}
