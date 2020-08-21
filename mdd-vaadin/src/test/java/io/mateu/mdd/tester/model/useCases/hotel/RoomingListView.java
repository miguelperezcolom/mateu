package io.mateu.mdd.tester.model.useCases.hotel;

import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.ui.Grid;
import com.vaadin.ui.StyleGenerator;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.NotInList;
import io.mateu.mdd.core.interfaces.AbstractJPQLListView;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter@Setter@Slf4j
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
    public Query buildQuery(EntityManager em, List<QuerySortOrder> sortOrders, boolean forCount) throws Throwable {
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
        log.debug("send rooming to " + email + " for " + selection.size() + " bookings");
    }

    @Action
    public void sendInstance(Set<Row> selection) {
        log.debug("send rooming for " + selection.size() + " bookings");
    }

    @Override
    public void decorateGrid(Grid<Row> grid) {
        grid.getColumns().forEach(col -> {

            StyleGenerator old = ((Grid.Column) col).getStyleGenerator();

            ((Grid.Column)col).setStyleGenerator(new StyleGenerator() {
                @Override
                public String apply(Object o) {
                    String s = null;
                    if (old != null) s = old.apply(o);

                    if (o instanceof Row) {
                        if (((Row)o).getName().contains("x")) s = (s != null)?s + " cancelled":"cancelled";
                    }
                    return s;
                }
            });
        });
    }

}
