package io.mateu.mdd.ui.cruds.commands;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class DeleteRowsCommand {

  private List<Object> rows;

  private Class entityClass;
}
