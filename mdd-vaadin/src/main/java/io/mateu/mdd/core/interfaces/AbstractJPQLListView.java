package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import org.eclipse.persistence.internal.helper.DatabaseField;
import org.eclipse.persistence.internal.jpa.EJBQueryImpl;
import org.eclipse.persistence.jpa.JpaEntityManager;
import org.eclipse.persistence.jpa.JpaQuery;
import org.eclipse.persistence.queries.DatabaseQuery;
import org.eclipse.persistence.sessions.DatabaseRecord;
import org.eclipse.persistence.sessions.Record;
import org.eclipse.persistence.sessions.Session;

import javax.persistence.EntityManager;
import javax.persistence.Parameter;
import javax.persistence.Query;
import java.lang.reflect.InvocationTargetException;
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

                    for (Object o : q.getResultList()) l.add((R) ReflectionHelper.fillQueryResult((Object[]) o, getNewRowInstance()));


                }
            });
        } catch (Throwable e) {
            MDD.alert(e);
            for (int i = 0; i < limit - offset; i++) l.add(null);
        }

        return l;
    }

    public R getNewRowInstance() throws IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        Class rowClass = getRowClass();
        return (R) ReflectionHelper.newInstance(rowClass);
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

    public Query getCountQueryForEclipseLink(EntityManager em, Query q) {

        Session session = em.unwrap(JpaEntityManager.class).getActiveSession();
        //DatabaseQuery databaseQuery = q.unwrap(EJBQueryImpl.class).getDatabaseQuery();
        DatabaseQuery databaseQuery = q.unwrap(JpaQuery.class).getDatabaseQuery();
        DatabaseRecord recordWithValues= new DatabaseRecord();
        q.getParameters().forEach(p -> recordWithValues.add(new DatabaseField(p.getName()), q.getParameterValue(p)));
        databaseQuery.prepareCall(session, recordWithValues);
        //Record r = databaseQuery.getTranslationRow();
        String bound = databaseQuery.getTranslatedSQLString(session, recordWithValues);
        String sqlString = databaseQuery.getSQLString();

        System.out.println("bound=" + bound);

        /*
        JpaQuery xq = q.unwrap(JpaQuery.class);
        DatabaseQuery dbQuery = xq.getDatabaseQuery();
        Session session = em.unwrap(JpaEntityManager.class).getActiveSession();
        String bound = dbQuery.getTranslatedSQLString(session, dbQuery.getTranslationRow());
        */
        Query qt = em.createNativeQuery("select count(*) from (" + bound + ") x");
        return qt;
    }

    public static void test(AbstractJPQLListView view) throws Throwable {


        //StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();

        /*
        Class ec = new Object() {}
                .getClass()
                .getEnclosingClass();
                */
        //Class ec = Class.forName(stackTrace[stackTrace.length - 1].getClassName());
        //System.out.println("ec=" + ec.getName());

        try {
            Helper.notransact(em -> {
                Query q = view.buildQuery(em, false);
                System.out.println(q.getResultList());
                Query qt = em.createNativeQuery("select count(*) from (" + q.unwrap(JpaQuery.class).getDatabaseQuery().getSQLString() + ") x");
                q.getParameters().forEach(p -> qt.setParameter(p.getName(), q.getParameterValue(p)));
                System.out.println(qt.getSingleResult());
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }


        try {
            Helper.notransact(em -> {
                System.out.println(view.buildQuery(em, true).getResultList());
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }



}
