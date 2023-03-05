package io.mateu.remote.dtos;

import lombok.Data;

import java.util.List;

@Data
public class Crud implements ViewMetadata {

    private final ViewMetadataType type = ViewMetadataType.Crud;

    private SearchForm searchForm;

    private List<Column> columns;

}
