package io.mateu.dtos;

import java.util.List;

public record Crud(
    String dataPrefix,
    String listId,
    String title,
    String subtitle,
    boolean canEdit,
    SearchForm searchForm,
    List<Column> columns,
    List<Action> actions)
    implements ViewMetadata {}
