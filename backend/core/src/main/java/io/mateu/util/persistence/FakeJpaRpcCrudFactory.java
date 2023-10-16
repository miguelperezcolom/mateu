package io.mateu.util.persistence;

import io.mateu.mdd.core.interfaces.JpaRpcCrudFactory;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import org.apache.commons.lang3.NotImplementedException;
import org.springframework.stereotype.Service;

@Service
public class FakeJpaRpcCrudFactory implements JpaRpcCrudFactory {
    @Override
    public Listing create(Object parentEntity, FieldInterfaced field) throws Exception {
        throw new NotImplementedException();
    }
}
