package tests.reflection;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.List;

public class MiJPQLListViewCaso1 extends SubclaseAbstractJPQLListView {


    @Override
    public Query buildQuery(EntityManager em, List list, boolean forCount) throws Throwable {
        return null;
    }

    @Override
    public List rpc(Object filters, List list, int offset, int limit) throws Throwable {
        return null;
    }

    @Override
    public int gatherCount(Object filters) throws Throwable {
        return 0;
    }

}
