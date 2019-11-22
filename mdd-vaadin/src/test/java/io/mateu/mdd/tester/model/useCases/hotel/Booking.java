package io.mateu.mdd.tester.model.useCases.hotel;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.model.common.Resource;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import io.mateu.mdd.tester.model.useCases.bankAccount.Payment;
import io.mateu.mdd.vaadinport.vaadin.components.EditorViewStyler;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorViewComponent;
import lombok.MateuMDDEntity;
import lombok.extern.slf4j.Slf4j;
import org.javamoney.moneta.FastMoney;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Slf4j@MateuMDDEntity
public class Booking implements EditorViewStyler {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    @ListColumn
    @MainSearchFilter
    private long id;

    @ListColumn
    private String leadName;

    @Action(attachToField = "leadName")
    public void actionOnLeadName() {
        System.out.println("bbbbbbbb");
    }

    private LocalDateTime ldt;

    public void setLdt(LocalDateTime ldt) {
        this.ldt = ldt;
        if (ldt != null) setDd(ldt.toLocalDate());
    }

    @NotNull
    private LocalDate dd;

    public void setDd(LocalDate dd) {
        this.dd = dd;
    }

    public boolean isDdVisible() {
        return false;
    };

    @Section("aaaa")
    @ManyToOne
    @ListColumn
    @Output
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

    @Action(attachToField = "lines")
    public void actionOnLines() {
        System.out.println("aaaa");
    }


    @OneToMany(cascade = CascadeType.ALL)@UseLinkToListView(addEnabled = true)
    private List<Payment> payments = new ArrayList<>();

    @ListColumn
    private int pax;

    private int adultsx;

    @SameLine
    private int childrenx;

    @SameLine
    private int juniors;

    @SameLine
    private int seniors;

    @SameLine
    private int infants;

    private double doble;


    public boolean isAdultsxVisible() {
        return pax > 0;
    }

    public boolean isChildrenxVisible() {
        return false;
    }

    public boolean isJuniorsVisible() {
        return false;
    }

    public boolean isSeniorsVisible() {
        return false;
    }

    public boolean isInfantsVisible() {
        return false;
    }


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
    @UseLinkToListView(addEnabled = true, deleteEnabled = true)
    private List<BookingLog> _log = new ArrayList<>();

    @Action(attachToField = "_log")
    public void actionOnLog(Set<BookingLog> selection, String texto) {
        selection.forEach(l -> l.setText(texto));
        _log.add(new BookingLog());
    }


    @OneToMany(cascade = CascadeType.ALL)
    private List<Resource> resources = new ArrayList<>();

    @Ignored
    private transient boolean updatePending = false;
    @Ignored
    private transient boolean updating = false;



    @Action(icon = VaadinIcons.ENVELOPES, isGroup = true)
    public void send() {
        MDD.alert("por aquí no debería pasar");
    }

    @Action(icon = VaadinIcons.ENVELOPE, group = "send")
    public void send1() {
        MDD.alert("opción 1");
    }

    @Action(icon = VaadinIcons.ENVELOPE_O, group = "send")
    public void send2() {
        MDD.alert("opción 2");
    }

    @Action(icon = VaadinIcons.ENVELOPE_OPEN, group = "send")
    public void send3() {
        MDD.alert("opción 3");
    }



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


    @Action(order = 5, confirmationMessage = "Are you sure you want to confirm this booking?", style = CSS.GREENFGD, icon = VaadinIcons.CHECK)
    @NotWhenCreating
    public void confirm(EntityManager em) {
        setActive(true);
        em.merge(this);
    }

    @DependsOn("active")
    public boolean isConfirmVisible() {
        return !isActive();
    }


    @Action(order = 5, confirmationMessage = "Are you sure you want to unconfirm this booking?", style = CSS.REDFGD, icon = VaadinIcons.CLOSE)
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

    @Override
    public void apply(EditorViewComponent editorViewComponent) {
        editorViewComponent.removeStyleNames("mdd-red-fgd");
        if (pax > 0) editorViewComponent.addStyleName("mdd-red-fgd");
    }
}
