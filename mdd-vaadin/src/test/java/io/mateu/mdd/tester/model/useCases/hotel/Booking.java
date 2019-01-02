package io.mateu.mdd.tester.model.useCases.hotel;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter@Setter
public class Booking {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String leadName;

    @ManyToOne
    private Hotel hotel;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "booking")
    private List<HotelBookingLine> lines = new ArrayList<>();

    public String getLinesHtml() {

        String h = "<div class='lines'>";
        for (HotelBookingLine l : lines) {
            h += "<div class='line" + (l.isActive() ? "" : " cancelled") + "'>";
            h += l.toHtml();
            h += "</div>";
        }
        h += "</div>";

        return h;
    }



    @KPI
    private double total;

    private boolean overrideValue;

    private double overridedValue;

    @DependsOn("overrideValue")
    public boolean isOverridedValueVisible() {
        return overrideValue;
    }


    private boolean active;


    @Ignored
    private transient boolean updatePending = false;
    @Ignored
    private transient boolean updating = false;

    @PostLoad
    public void postload() {
        updating = updatePending;
    }

    public void askForUpdate() {
        System.out.println("************askForUpdate(" + updatePending + ", " + updating + ")");
        if (!updatePending && !updating) {
            System.out.println("************askForUpdate(): passed");
            setUpdatePending(true);
            WorkflowEngine.add(() -> {
                System.out.println("************askForUpdate(): running");
                try {
                    Helper.transact(em -> {
                        updateTotals(em);
                        em.merge(this);
                    });
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
                setUpdatePending(false);
                setUpdating(false);
                System.out.println("************askForUpdate(): done");
            });
        } else {
            System.out.println("************askForUpdate(): not passed");
        }
        System.out.println("************askForUpdate(): out");
    }

    private void updateTotals(EntityManager em) {
        if (overrideValue) setTotal(overridedValue);
        else {
            double total = 0;
            for (HotelBookingLine l : lines) if (l.isActive()) total += l.getPax() * 100;
            setTotal(Helper.roundEuros(total));
        }
    }





    @Action(order = 1)
    public void test() {
        System.out.println("test()");
    }


    @Action(order = 5, confirmationMessage = "Are you sure you want to confirm this booking?", style = ValoTheme.BUTTON_FRIENDLY, icon = VaadinIcons.CHECK)
    @NotWhenCreating
    public void confirm(EntityManager em) {
        setActive(true);
        em.merge(this);
    }

    @DependsOn("active")
    public boolean isConfirmVisible() {
        return !isActive();
    }


    @Action(order = 5, confirmationMessage = "Are you sure you want to unconfirm this booking?", style = ValoTheme.BUTTON_DANGER, icon = VaadinIcons.CLOSE)
    @NotWhenCreating
    public void unconfirm(EntityManager em) {
        setActive(false);
        em.merge(this);
    }

    @DependsOn("active")
    public boolean isUnconfirmVisible() {
        return isActive();
    }








    @Override
    public boolean equals(Object obj) {
        return this == obj || id == ((Booking)obj).getId();
    }

    @Override
    public String toString() {
        return leadName != null?leadName:"Booking " + getId();
    }


    /*
    solo se llama si hemos modificado algún valor de Booking
     */
    @PostPersist@PostUpdate
    public void post() {
        System.out.println("**************** Booking.pre()");
        askForUpdate();
    }
}
