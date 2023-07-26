package io.mateu.mdd.ui.cruds.commands;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Set;

@Builder@Getter
public class DeleteRowsCommand {

    private List<Object> rows;

    private Class entityClass;

}
