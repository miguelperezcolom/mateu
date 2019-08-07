package io.mateu.mdd.tester.model.useCases.hotel;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import io.mateu.mdd.tester.model.useCases.bankAccount.Payment;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter@Setter
public class Booking {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    @ListColumn
    @MainSearchFilter
    private long id;

    @ListColumn
    private String leadName;

    private LocalDateTime ldt;

    @ManyToOne
    @ListColumn
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


    @OneToMany(cascade = CascadeType.ALL)@UseLinkToListView(addEnabled = true)
    private List<Payment> payments = new ArrayList<>();

    @ListColumn
    private int pax;

    private double doble;

    @KPI@Money@Balance
    @ListColumn
    private double total;

    @Section("Prices")
    @ListColumn
    private boolean overrideValue;

    @Money
    @ListColumn
    private double overridedValue;

    @DependsOn("overrideValue")
    public boolean isOverridedValueVisible() {
        return overrideValue;
    }

    @ListColumn
    private boolean active;


    @OneToMany(cascade = CascadeType.ALL)
    @UseLinkToListView
    private List<BookingLog> log = new ArrayList<>();


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
