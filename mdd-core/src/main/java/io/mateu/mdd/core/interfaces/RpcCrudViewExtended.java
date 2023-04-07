package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;

import java.util.List;
import java.util.Map;
import java.util.Set;

public interface RpcCrudViewExtended {

    List<FieldInterfaced> getColumnFields();

    List<FieldInterfaced> getFilterFields();

    Class getEntityClass();


    boolean isAddEnabled();

    boolean isDeleteEnabled();

    boolean isEditHandled();

    Map<FieldInterfaced, String> getColumnIdsPerField();

    Map<FieldInterfaced, String> getColumnCaptionsPerField();
}
