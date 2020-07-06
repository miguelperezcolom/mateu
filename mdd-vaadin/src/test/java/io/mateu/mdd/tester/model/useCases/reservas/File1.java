package io.mateu.mdd.tester.model.useCases.reservas;

import com.vaadin.data.provider.DataProvider;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.model.common.Icon;
import io.mateu.mdd.core.model.common.Resource;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.tester.app.erp.Agencia;
import io.mateu.mdd.tester.model.useCases.hotel.Booking;
import lombok.MateuMDDEntity;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import java.io.File;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@MateuMDDEntity
public class File1 {

    @NotEmpty@Help("Este campo es bla, bla, bla")
    private String leadName;

    @OneToMany@UseCheckboxes
    private Set<Agencia> wwww = new HashSet<>();

    @PrePersist@PreUpdate
    public void pre() {
        System.out.println("zzzzzzzzzz");
    }

    @DependsOn("leadName")
    public DataProvider getWwwwDataProvider() {
        try {
            return new ListDataProvider(Helper.findAll(Agencia.class));
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return new ListDataProvider(new ArrayList());
    }


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


    @ManyToOne(cascade = CascadeType.ALL)
    private Resource attachment;

    @ManyToOne
    private Icon icon;



    @Action(order = 70, icon = VaadinIcons.BOLT)
    @NotWhenCreating
    public void requiredParam(@NotEmpty String param) throws Throwable {
        System.out.println(param);
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
