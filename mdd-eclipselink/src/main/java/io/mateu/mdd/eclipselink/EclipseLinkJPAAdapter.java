package io.mateu.mdd.eclipselink;

import io.mateu.mdd.shared.JPAAdapter;
import org.eclipse.persistence.config.CacheUsage;
import org.eclipse.persistence.config.QueryHints;
import org.eclipse.persistence.internal.helper.DatabaseField;
import org.eclipse.persistence.jpa.JpaEntityManager;
import org.eclipse.persistence.jpa.JpaQuery;
import org.eclipse.persistence.queries.DatabaseQuery;
import org.eclipse.persistence.sessions.DatabaseRecord;
import org.eclipse.persistence.sessions.Session;

import javax.persistence.EntityManager;
import javax.persistence.Query;

public class EclipseLinkJPAAdapter implements JPAAdapter {
    @Override
    public String extractSql(EntityManager em, Query q) {
        Session session = em.unwrap(JpaEntityManager.class).getActiveSession();
        //DatabaseQuery databaseQuery = q.unwrap(EJBQueryImpl.class).getDatabaseQuery();
        DatabaseQuery databaseQuery = q.unwrap(JpaQuery.class).getDatabaseQuery();
        DatabaseRecord recordWithValues= new DatabaseRecord();
        q.getParameters().forEach(p -> recordWithValues.add(new DatabaseField(p.getName()), q.getParameterValue(p)));
        databaseQuery.prepareCall(session, recordWithValues);
        //Record r = databaseQuery.getTranslationRow();
        String bound = databaseQuery.getTranslatedSQLString(session, recordWithValues);
        String sqlString = databaseQuery.getSQLString();

        /*
        JpaQuery xq = q.unwrap(JpaQuery.class);
        DatabaseQuery dbQuery = xq.getDatabaseQuery();
        Session session = em.unwrap(JpaEntityManager.class).getActiveSession();
        String bound = dbQuery.getTranslatedSQLString(session, dbQuery.getTranslationRow());
        */

        return bound;
    }

    @Override
    public void hint(Query q) {
        q.setHint(QueryHints.CACHE_USAGE, CacheUsage.DoNotCheckCache);
    }


}
