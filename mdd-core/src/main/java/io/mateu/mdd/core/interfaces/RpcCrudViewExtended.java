package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.shared.reflection.FieldInterfaced;
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
