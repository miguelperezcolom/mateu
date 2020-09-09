package io.mateu.showcase.tester.app.erp;

import com.google.common.base.Strings;
import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.shared.data.sort.SortDirection;
import io.mateu.mdd.core.interfaces.AbstractJPQLListView;
import io.mateu.mdd.util.Helper;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter@Setter
public class VistaReservas extends AbstractJPQLListView<LineaVistaReservas> {

    private String titular;

    @Override
    public Query buildQuery(EntityManager em, List<QuerySortOrder> sortOrders, boolean forCount) throws Throwable {
        String ql = "select ";

        if (forCount) ql += "count(x)";
        else ql += "new " + LineaVistaReservas.class.getName() + "(x.id, x.leadName)";

        ql += " from " + Reserva.class.getName() +" x ";
        Map<String, Object> params = new HashMap<>();
        String w = "";

        if (!Strings.isNullOrEmpty(titular)) {
            if (!"".equals(w)) w += " and ";
            w += " lower(x.leadName) like :l ";
            params.put("l", "%" + titular.trim().toLowerCase() + "%");
        }


        if (!"".equals(w)) {
            ql += " where " + w;
        }

        if (!forCount) {

            String sos = "";
            if (sortOrders != null) for (QuerySortOrder sortOrder : sortOrders) {
                if (!"".equals(sos)) sos += ", ";
                sos += "x." + sortOrder.getSorted();
                sos += SortDirection.ASCENDING.equals(sortOrder.getDirection())?" asc":" desc";
            }

            if (!"".equals(sos)) sos += ", ";
            sos += " x.id desc";

            if (!"".equals(sos)) ql += " order by " + sos;
        }



        Query q = em.createQuery(ql);
        params.forEach((k, v) -> q.setParameter(k, v));
        return q;    }

    @Override
    public boolean isEditHandled() {
        return true;
    }

    @Override
    public Object onEdit(LineaVistaReservas row) throws Throwable {
        return Helper.find(Reserva.class, row.getId());
    }

    public Object onEdit(String id) throws Throwable {
        return Helper.find(Reserva.class, Long.parseLong(id));
    }

}
