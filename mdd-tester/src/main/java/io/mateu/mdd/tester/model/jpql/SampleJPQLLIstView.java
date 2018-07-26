package io.mateu.mdd.tester.model.jpql;

import com.google.common.base.Strings;
import io.mateu.mdd.core.interfaces.AbstractJPQLListView;
import io.mateu.mdd.tester.model.entities.basic.BasicFieldsDemoEntity;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.HashMap;
import java.util.Map;

@Getter@Setter
public class SampleJPQLLIstView extends AbstractJPQLListView<SampleJPQLLIstView.Row> {

    private String filter;

    @Getter@Setter
    public class Row {

        private String name;

        private int age;

    }


    @Override
    public Query buildQuery(EntityManager em, boolean forCount) {

        String ql = "select ";

        if (forCount) {
            ql += " count(x) ";
        } else {
            ql += " x.stringField, x.intField ";
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

}
