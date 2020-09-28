package io.mateu.mdd.core.dev;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import io.mateu.mdd.shared.annotations.TextArea;
import io.mateu.util.Helper;
import io.mateu.util.persistence.JPAHelper;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter@Setter
public class JPQLTester {

    @TextArea
    private String jpql;

    @Output
    private String result;

    @Action(order = 10)
    public void select() throws Throwable {
        JPAHelper.notransact(em -> {
            result = "";
            List l = em.createQuery(jpql).setMaxResults(10).getResultList();
            result += l.size() + " records found:<br/>";
            result += "<table>";
            for (Object o : l) {
                result += "<tr>";
                if (o instanceof Object[]) {
                    for (Object i : (Object[]) o) {
                        result += "<td>" + i + "</td>";
                    }
                } else {
                    result += "<td>" + Helper.toJson(o) + "</td>";
                }
                result += "</tr>";
            }
            result += "</table>";
            result += "end.";
        });
    }

    @Action(order = 20)
    public void update() throws Throwable {
        JPAHelper.notransact(em -> {
            int r = em.createQuery(jpql).executeUpdate();
            result = r + " records updated<br/>";
        });
    }

}
