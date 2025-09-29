package io.mateu.dtos;

import java.util.Map;

/** Metadata for a html element */
public record ElementDto(
    String name, Map<String, String> attributes, Map<String, String> on, String content)
    implements ComponentMetadataDto {}
