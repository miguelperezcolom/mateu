package io.mateu.core.domain.model.util.persistence;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.JpaRpcCrudFactory;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.JpaCrud;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.Listing;
import org.apache.commons.lang3.NotImplementedException;
import org.springframework.stereotype.Service;

@Service
public class FakeJpaRpcCrudFactory implements JpaRpcCrudFactory {
  @Override
  public Listing create(Object parentEntity, Field field) {
    throw new NotImplementedException();
  }

  @Override
  public Listing create(JpaCrud crud) {
    throw new NotImplementedException();
  }
}
