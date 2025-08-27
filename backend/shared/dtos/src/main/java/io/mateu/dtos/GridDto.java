package io.mateu.dtos;

import java.util.List;

/** Metadata for a html element */
public record GridDto(
    List<ComponentDto> content,
    DataPageDto page,
    boolean tree,
    int size,
    boolean wrapCellContent,
    boolean compact,
    boolean noBorder,
    boolean noRowBorder,
    boolean columnBorders,
    boolean rowStripes,
    String vaadinGridCellBackground,
    String vaadinGridCellPadding)
    implements ComponentMetadataDto {}
