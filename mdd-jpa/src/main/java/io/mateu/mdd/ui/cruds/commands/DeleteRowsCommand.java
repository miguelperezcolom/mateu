package io.mateu.mdd.ui.cruds.commands;

import lombok.Builder;
import lombok.Getter;

import java.util.Set;

@Builder@Getter
public class DeleteRowsCommand {

    private Set<Object> rows;

    private Class entityClass;

}
