package io.mateu.mdd.tester.model.useCases.hotel;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import io.mateu.mdd.tester.model.useCases.bankAccount.Payment;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.javamoney.moneta.FastMoney;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter@Setter
@Slf4j
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

    public void setHotel(Hotel hotel) {
        if (hotel != null && "valparaiso".equalsIgnoreCase(hotel.getName())) throw new Error("No puede ser el valaparaiso");
        this.hotel = hotel;
    }

    @SectionKPI
    private double totalPax = 3;

    @SectionKPI
    private double adults = 3;

    @SectionKPI
    private double children = 0;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "booking")
    @UseTable(fields = "pax,room,active")
    private List<HotelBookingLine> lines = new ArrayList<>();

    public String getXXLinesHtml() {

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
    private List<BookingLog> _log = new ArrayList<>();


    @Ignored
    private transient boolean updatePending = false;
    @Ignored
    private transient boolean updating = false;

    @PostLoad
    public void postload() {
        updating = updatePending;
    }

    public void askForUpdate() {
        log.debug("************askForUpdate(" + updatePending + ", " + updating + ")");
        if (!updatePending && !updating) {
            log.debug("************askForUpdate(): passed");
            setUpdatePending(true);
            WorkflowEngine.add(() -> {
                log.debug("************askForUpdate(): running");
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
                log.debug("************askForUpdate(): done");
            });
        } else {
            log.debug("************askForUpdate(): not passed");
        }
        log.debug("************askForUpdate(): out");
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
        log.debug("test()");
        totalPax+=10;
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




    @Action(order = 1, section = "General")
    public void subtest() {
        log.debug("subtest()");
        totalPax++;
        pax++;
    }

    @Action(order = 2, section = "General")
    public void subconfirm() {
        log.debug("subconfirm()");
        adults++;
        leadName += "zz";
    }

    @Action(order = 3, section = "General", group = "subconfirm")
    public void subconfirmz() {
        log.debug("subconfirmz()");
        adults++;
        leadName += "zz";
    }

    @Action(order = 100, refreshOnBack = true)
    public Object refreshOnBack() {
        return new RefreshOnBackForm(this);
    }


    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && obj instanceof Booking && id > 0 && id == ((Booking)obj).getId());
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
        log.debug("**************** Booking.post()");
        askForUpdate();
    }

    @PostRemove
    public void postRemove() {
        log.debug("**************** Booking.portRemove()");
        updatePending = true;
        updating = true;
    }



    @Action(order = 4, icon = VaadinIcons.EURO, saveBefore = true, saveAfter = true)
    @NotWhenCreating
    public void sendPaymentEmail(@NotEmpty String changeEmail, @NotEmpty String subject, String postscript, @NotNull Hotel hotel, FastMoney amount) throws Throwable {
        System.out.println("hola!!!");
    }
}
