package io.mateu.dtos;

/**
 * Navigation link rendered as an icon at the right side of a form field.
 *
 * @param href destination URL or route; supports {@code ${...}} state interpolation client-side
 * @param icon icon to render; the renderer picks a sensible default when empty
 * @param title tooltip for the icon; supports {@code ${...}} state interpolation client-side
 * @param target link target, e.g. {@code _blank} to open in a new tab
 */
public record NavLinkDto(String href, String icon, String title, String target) {}
