package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;

public interface JpaRpcCrudFactory {

  Listing create(Object parentEntity, FieldInterfaced field) throws Exception;
}
