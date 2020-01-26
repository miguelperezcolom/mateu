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
import javax.persistence.OrderColumn;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@MateuMDDEntity
public class File1 {

    private String leadName;

    @OneToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH}, mappedBy = "file")
    //@OneToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH}, mappedBy = "file")
    @OrderColumn(name = "ordenenfile")
    @NotInlineEditable
    private List<Reserva1> reservas = new ArrayList<>();

    public List<Reserva1> getReservas() {
        return reservas;
    }

    public void setReservas(List<Reserva1> reservas) {
        this.reservas = reservas;
    }


    @Action(order = 80, icon = VaadinIcons.CLOSE, attachToField = "reservas")
    @NotWhenCreating
    public void cancel(EntityManager em, Set<Reserva1> selection) throws Throwable {
        System.out.println(selection);
    }

    @Action(order = 75, icon = VaadinIcons.PLUS_CIRCLE_O, saveBefore = true, refreshOnBack = true)
    @NotWhenCreating
    public void incorporate(Set<CapturedBooking> capturedBookings) throws Throwable {
        System.out.println(capturedBookings);
    }

    @Action(order = 75, icon = VaadinIcons.CLOSE, saveBefore = true, refreshOnBack = true)
    @NotWhenCreating
    public static void cancel(Set<File1> files) throws Throwable {
        System.out.println(files);
    }

}
