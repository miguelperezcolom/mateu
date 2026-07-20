package io.mateu.dtos;

/**
 * Lateral navigation across peer objects, rendered as previous/next arrows in the page header (the
 * Oracle Redwood "next/previous object" header element). A {@code null} route on a side hides that
 * arrow.
 */
public record PeerNavDto(String prevLabel, String prevRoute, String nextLabel, String nextRoute) {}
