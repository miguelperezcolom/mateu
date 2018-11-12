package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.ArrayList;
import java.util.List;

public abstract class AbstractJPQLListView<R> implements RpcView<AbstractJPQLListView, R> {

    @Override
    public List<R> rpc(AbstractJPQLListView filters, int offset, int limit) {

        List<R> l = new ArrayList<>();

        try {

            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    Query q = buildQuery(em, false);

                    q.setFirstResult(offset);
                    q.setMaxResults(limit);

                    Class rowClass = getRowClass();
                    
                    for (Object o : q.getResultList()) l.add((R) ReflectionHelper.fillQueryResult((Object[]) o, rowClass));


                }
            });
        } catch (Throwable e) {
            MDD.alert(e);
            for (int i = 0; i < limit - offset; i++) l.add(null);
        }

        return l;
    }

    @Override
    public int gatherCount(AbstractJPQLListView filters) {

        int[] c = {0};

        try {

            Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    Query q = buildQuery(em, true);

                    c[0] = ((Long) q.getSingleResult()).intValue();

                }
            });
        } catch (Throwable e) {
            MDD.alert(e);
        }

        return c[0];
    }

    public abstract Query buildQuery(EntityManager em, boolean forCount) throws Throwable;

    public Class getRowClass() {
        return ReflectionHelper.getGenericClass(this.getClass(), RpcView.class, "C");
    }

}
