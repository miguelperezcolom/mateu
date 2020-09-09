package io.mateu.showcase.tester.model.useCases.hotel;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.CascadeType;
import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@Getter@Setter
public class RefreshOnBackForm {

    @Output
    private final Booking booking;

    private String nuevoLeadName;

    @OneToMany(cascade = CascadeType.ALL)
    private List<RefreshOnBackFormLine> lines = new ArrayList<>();


    public RefreshOnBackForm(Booking booking) {
        this.booking = booking;
        nuevoLeadName = booking.getLeadName();
    }

    @Action
    public void grabar() throws Throwable {
        Helper.transact(em -> {
            em.find(Booking.class, booking.getId()).setLeadName(nuevoLeadName);
        });
        MDDUI.get().getNavegador().goBack();
    }

}
