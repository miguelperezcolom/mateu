package io.mateu.core.domain.uidefinition.core.interfaces;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.shared.interfaces.JpaCrud;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;

public interface JpaRpcCrudFactory {

  Listing create(Object parentEntity, Field field) throws Exception;

  Listing create(JpaCrud crud) throws Exception;
}
