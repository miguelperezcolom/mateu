package io.mateu.core.domain.uidefinition.core.interfaces;

import io.mateu.core.domain.uidefinition.shared.interfaces.JpaCrud;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.core.domain.uidefinition.shared.reflection.FieldInterfaced;

public interface JpaRpcCrudFactory {

  Listing create(Object parentEntity, FieldInterfaced field) throws Exception;

  Listing create(JpaCrud crud) throws Exception;
}
