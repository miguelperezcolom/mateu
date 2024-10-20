package io.mateu.jpa.domain.ui.cruds.commands;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class DeleteRowsCommand {

  private List<Object> rows;

  private Class entityClass;
}
