package io.mateu.dtos;

/**
 * The page template a page fills — the design system's own template (Redwood's {@code
 * ItemOverviewPage}…), named by {@code type}. Only the template's own values travel here (its
 * images); its slots arrive already laid out among the page's children, each in a container whose
 * id says which slot it is ({@code item-overview-body}, {@code item-overview-footer}, {@code
 * item-overview-main}), so a renderer without the template draws them as they come and one with it
 * places each slot where the template wants it.
 */
public record PageTemplateDto(String type, TemplateImageDto avatar, TemplateImageDto photo) {}
