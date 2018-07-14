package io.mateu.mdd.core.views;

import io.mateu.mdd.core.data.GridData;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.data.UserData;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.List;

public abstract class AbstractJPQLView<F, C> implements RpcView<F, C> {

    public abstract Query buildQuery(EntityManager em, UserData user, F filters);

    @Override
    public List<C> rpc(F filters, int offset, int limit) {

        //todo: hacer consulta



        return null;
    }

    @Override
    public int gatherCount(F filters) {

        //todo: hacer consulta

        return 0;
    }
}
