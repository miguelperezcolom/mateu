package io.mateu.mdd.tester.model.useCases.hotel;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.NotInList;
import io.mateu.mdd.core.interfaces.AbstractJPQLListView;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Getter@Setter
public class RoomingListView extends AbstractJPQLListView<RoomingListView.Row> {

    private LocalDate from;
    private LocalDate to;


    @Getter@Setter
    public class Row {
        @NotInList
        private long partnerId;
        private String name;
        private long bookings;
    }



    @Override
    public Query buildQuery(EntityManager em, boolean forCount) throws Throwable {
        String ql = "";

        ql += " select h.id, h.name, count(*) ";

        ql+= " from booking b inner join hotel h on h.id = b.hotel_id ";

        ql += " group by h.id, h.name ";
        ql += " order by h.name ";

        Query q = em.createNativeQuery(ql);

        if (forCount) q = getCountQueryForEclipseLink(em, q);

        return q;
    }

    @Override
    public boolean isEditHandled() {
        return true;
    }

    @Override
    public Object onEdit(Row row) {
        return new RoomingForm(row);
    }

    @Action
    public static void send(String email, String text, Set<Row> selection) {
        System.out.println("send rooming to " + email + " for " + selection.size() + " bookings");
    }

    @Action
    public void sendInstance(Set<Row> selection) {
        System.out.println("send rooming for " + selection.size() + " bookings");
    }

    public static void main(String[] args) {
        try {
            test(new RoomingListView());
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
    }

}
