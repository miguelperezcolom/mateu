package io.mateu.dtos;

/**
 * A view
 *
 * @param header Header content
 * @param left Left aside content
 * @param main Main content
 * @param right Right aside content
 * @param footer Footer content
 */
public record ViewDto(
    ViewPartDto header,
    ViewPartDto left,
    ViewPartDto main,
    ViewPartDto right,
    ViewPartDto footer) {}
