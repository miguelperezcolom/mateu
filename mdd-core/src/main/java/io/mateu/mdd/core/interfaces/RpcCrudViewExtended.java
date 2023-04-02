package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;

import java.util.List;
import java.util.Set;

public interface RpcCrudViewExtended {

    List<String> getColumnFields();

    List<FieldInterfaced> getFilterFields();

    Class getEntityClass();


    boolean isAddEnabled();

    boolean isDeleteEnabled();

    boolean isEditHandled();


}
