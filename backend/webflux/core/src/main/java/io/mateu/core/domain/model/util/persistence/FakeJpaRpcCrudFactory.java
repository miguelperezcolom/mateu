package io.mateu.core.domain.model.util.persistence;

import io.mateu.uidl.core.interfaces.JpaCrud;
import io.mateu.uidl.core.interfaces.JpaRpcCrudFactory;
import io.mateu.uidl.core.interfaces.Listing;
import org.apache.commons.lang3.NotImplementedException;
import org.springframework.stereotype.Service;

@Service
public class FakeJpaRpcCrudFactory implements JpaRpcCrudFactory {

  @Override
  public Listing create(JpaCrud crud) {
    throw new NotImplementedException();
  }
}
