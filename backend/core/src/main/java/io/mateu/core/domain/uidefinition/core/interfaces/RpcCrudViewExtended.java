package io.mateu.core.domain.uidefinition.core.interfaces;

import io.mateu.core.domain.model.reflection.Field;
import java.util.List;
import java.util.Map;

public interface RpcCrudViewExtended {

  List<Field> getColumnFieldNames();

  List<Field> getFilterFields();

  Class getEntityClass();

  boolean isAddEnabled();

  boolean isDeleteEnabled();

  boolean isEditHandled();

  Map<Field, String> getColumnIdsPerField();

  Map<Field, String> getColumnCaptionsPerField();
}