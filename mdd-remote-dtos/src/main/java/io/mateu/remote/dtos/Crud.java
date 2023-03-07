package io.mateu.remote.dtos;

import lombok.*;

import java.util.List;

@Data@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Crud implements ViewMetadata {

    private final ViewMetadataType type = ViewMetadataType.Crud;

    private String title;

    private String subtitle;

    private SearchForm searchForm;

    private List<Column> columns;

    private List<Action> actions;

}
