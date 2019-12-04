package io.mateu.mdd.tester.model.useCases.reservas;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.NotInlineEditable;
import io.mateu.mdd.core.annotations.NotWhenCreating;
import io.mateu.mdd.core.annotations.UseTable;
import io.mateu.mdd.tester.model.useCases.hotel.Booking;
import lombok.MateuMDDEntity;

import javax.persistence.CascadeType;
import javax.persistence.EntityManager;
import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@MateuMDDEntity
public class File1 {

    private String leadName;

    @OneToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH}, mappedBy = "file")
    @UseTable(fields = "del,al,servicio,precio")
    @NotInlineEditable
    private List<Reserva1> reservas = new ArrayList<>();

    public List<Reserva1> getReservas() {
        return reservas;
    }

    public void setReservas(List<Reserva1> reservas) {
        this.reservas = reservas;
    }

    @Action(order = 70, icon = VaadinIcons.PLUS, attachToField = "bookings")
    @NotWhenCreating
    public void incorporate() throws Throwable {
        MDD.alert("todavía no");
    }

    @Action(order = 80, icon = VaadinIcons.CLOSE, attachToField = "bookings")
    @NotWhenCreating
    public void cancel(EntityManager em, Set<Booking> selection) throws Throwable {
        MDD.alert("todavía no");
    }

}
