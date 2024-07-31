package io.mateu.core.domain.uidefinition.core.interfaces;

import io.mateu.core.domain.model.reflection.FieldInterfaced;
import java.util.List;
import java.util.Map;

public interface RpcCrudViewExtended {

  List<FieldInterfaced> getColumnFieldNames();

  List<FieldInterfaced> getFilterFields();

  Class getEntityClass();

  boolean isAddEnabled();

  boolean isDeleteEnabled();

  boolean isEditHandled();

  Map<FieldInterfaced, String> getColumnIdsPerField();

  Map<FieldInterfaced, String> getColumnCaptionsPerField();
}
