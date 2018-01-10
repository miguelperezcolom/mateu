package io.mateu.mdd.model.rpc;

import io.mateu.erp.model.product.hotel.RoomType;
import io.mateu.erp.model.util.Helper;
import io.mateu.erp.model.util.JPATransaction;
import io.mateu.ui.core.client.views.RPCView;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.GridData;
import io.mateu.ui.core.shared.UserData;
import io.mateu.ui.mdd.server.ERPServiceImpl;
import io.mateu.ui.mdd.server.annotations.Action;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.EntityManager;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter@Setter
public class StopSalesView implements RPCView<StopSalesMonth, StopSalesLine> {

    @NotNull
    private Hotel hotel;

    private Room room;


    @Override
    public GridData rpc() throws Throwable {

        LocalDate desde = LocalDate.now();
        desde = LocalDate.of(desde.getYear(), desde.getMonthValue(), 1);
        LocalDate hasta = LocalDate.of(desde.getYear(), desde.getMonth(), desde.getDayOfMonth()).plusMonths(1).minusDays(1);

        Map<LocalDate, StopSalesLine> m = new HashMap<>();

        for (StopSalesLine l : getHotel().getStopSalesLines()) if (!l.getEnd().isBefore(desde)) {
            for (LocalDate d = l.getStart(); !d.isAfter(l.getEnd()); d = d.plusDays(1)) if (!d.isBefore(desde)) {
                m.put(d, l);
                if (d.isAfter(hasta)) hasta = d;
            }
        }


        GridData gd = new GridData();

        int mes = -1;

        DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy/MM");

        Data data = null;

        for (LocalDate d = desde; !d.isAfter(hasta); d = d.plusDays(1)) {
            if (mes != d.getMonthValue()) {
                gd.getData().add(data = new Data());
                data.set("year", d.getYear());
                data.set("month", d.getMonthValue());
                mes = d.getMonthValue();
            }
            Data dx = new Data();
            dx.set("_text", "" + d.getDayOfMonth());
            DayClosingStatus s = DayClosingStatus.OPEN;
            StopSalesLine l = m.get(d);
            if (l != null) {
                s = DayClosingStatus.CLOSED;
                if (l.getRooms().size() > 0) s = DayClosingStatus.PARTIAL;
                dx.set("_id", l.getId());
            }
            String css = "o-open";
            if (DayClosingStatus.CLOSED.equals(s)) css = "o-closed";
            if (DayClosingStatus.PARTIAL.equals(s)) css = "o-partial";
            dx.set("_css", css);
            data.set("day_" + d.getDayOfMonth(), dx);
        }

        gd.setOffset(0);
        gd.setTotalLength(gd.getData().size());

        return gd;
    }



    @Action(name = "Enter stop sales")
    public void add(UserData user, StopSalesAction action, LocalDate start, LocalDate end,
                    List<Room> rooms) throws Throwable {

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {


                StopSalesLine l;
                getHotel().getStopSalesLines().add(l = new StopSalesLine());
                em.persist(l);
                l.setStart(start);
                l.setEnd(end);
                l.setHotel(getHotel());
                l.setOnNormalInventory(true);
                l.setOnSecurityInventory(true);
                l.getRooms().addAll(rooms);

                System.out.println("add()");

            }
        });


    }



}
