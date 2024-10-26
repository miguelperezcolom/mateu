package io.mateu.core.domain.uidefinitionlanguage.core.interfaces;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.JpaCrud;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.Listing;

public interface JpaRpcCrudFactory {

  Listing create(Object parentEntity, Field field) throws Exception;

  Listing create(JpaCrud crud) throws Exception;
}
