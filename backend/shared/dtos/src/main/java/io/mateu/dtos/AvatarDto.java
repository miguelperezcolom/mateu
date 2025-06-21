package io.mateu.dtos;


/** Metadata for a html element */
public record AvatarDto(String name, String abbreviation, String image)
    implements ComponentMetadataDto {}
