package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.shared.interfaces.JpaCrud;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;

public interface JpaRpcCrudFactory {

  Listing create(Object parentEntity, FieldInterfaced field) throws Exception;

  Listing create(JpaCrud crud) throws Exception;
}
