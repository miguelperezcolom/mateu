package io.mateu.mdd.tester.model.jpql;

import com.google.common.base.Strings;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.interfaces.AbstractJPQLCrudView;
import io.mateu.mdd.tester.model.entities.basic.BasicFieldsDemoEntity;
import io.mateu.mdd.tester.model.pojos.SamplePPOJO;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.HashMap;
import java.util.Map;

@Getter@Setter
public class SampleJPQLToPPOJOCrudView extends AbstractJPQLCrudView<SampleJPQLToPPOJOCrudView.Row, SamplePPOJO> {

    private String filter;

    @Override
    public Object deserializeId(String sid) {
        return Long.parseLong(sid);
    }

    @Getter@Setter
    public class Row {

        @Ignored
        private long id;

        private String name;

        private int age;

        @Override
        public String toString() {
            return "" + id;
        }
    }


    @Override
    public Query buildQuery(EntityManager em, boolean forCount) {

        String ql = "select ";

        if (forCount) {
            ql += " count(x) ";
        } else {
            ql += " x.id, x.stringField, x.intField ";
        }

        ql += " from " + BasicFieldsDemoEntity.class.getName() + " x ";


        Map<String, Object> params = new HashMap<>();

        if (!Strings.isNullOrEmpty(filter)) {

            ql += " where lower(x.stringField) like :p0 ";

            params.put("p0", "%" + filter.toLowerCase() + "%");

        }

        if (!forCount) {
            ql += " order by x.id ";
        }


        Query q = em.createQuery(ql);

        params.keySet().forEach(k -> q.setParameter(k, params.get(k)));

        return q;
    }

    @Override
    public Class getRowClass() {
        return Row.class;
    }
}
