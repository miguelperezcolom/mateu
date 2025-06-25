package io.mateu.dtos;

/**
 * A view
 *
 * @param header Header items
 * @param left Left aside items
 * @param main Main items
 * @param right Right aside items
 * @param footer Footer items
 */
public record ViewDto(
    ViewPartDto header,
    ViewPartDto left,
    ViewPartDto main,
    ViewPartDto right,
    ViewPartDto footer) {}
