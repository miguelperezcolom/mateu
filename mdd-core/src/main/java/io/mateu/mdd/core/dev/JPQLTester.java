package io.mateu.mdd.core.dev;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.annotations.TextArea;
import io.mateu.mdd.core.util.Helper;
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
        Helper.notransact(em -> {
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
        Helper.notransact(em -> {
            int r = em.createQuery(jpql).executeUpdate();
            result = r + " records updated<br/>";
        });
    }

}
