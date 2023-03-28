package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.shared.reflection.FieldInterfaced;

import java.util.List;

public interface RpcCrudViewExtended {

    List<String> getColumnFields();

    List<FieldInterfaced> getFilterFields();

    Class getEntityClass();

}
