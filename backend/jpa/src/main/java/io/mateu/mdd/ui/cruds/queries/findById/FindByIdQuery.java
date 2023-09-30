package io.mateu.mdd.ui.cruds.queries.findById;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class FindByIdQuery {

  private Object id;

  private Class entityClass;
}
