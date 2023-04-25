package io.mateu.remote.dtos;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Crud implements ViewMetadata {

    private final ViewMetadataType type = ViewMetadataType.Crud;

    private String dataPrefix;

    private String listId;

    private String title;

    private String subtitle;

    private boolean canEdit;

    private SearchForm searchForm;

    private List<Column> columns;

    private List<Action> actions;

}
