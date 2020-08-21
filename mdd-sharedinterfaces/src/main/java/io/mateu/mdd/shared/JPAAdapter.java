package io.mateu.mdd.shared;

import javax.persistence.EntityManager;
import javax.persistence.Query;

public interface JPAAdapter {

    String extractSql(EntityManager em, Query q);

    void hint(Query q);
}
