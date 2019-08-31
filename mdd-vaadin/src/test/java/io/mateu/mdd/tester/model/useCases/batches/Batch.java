package io.mateu.mdd.tester.model.useCases.batches;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.HasChangesSignature;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity@Getter@Setter@Indelible
public class Batch implements HasChangesSignature {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Version
    private int version;

    @Output
    private LocalDate created = LocalDate.now();

    @Output
    private User owner = MDD.getCurrentUser();

    @Money@KPI
    private double totalSale;

    @Money@KPI
    private double totalCost;

    @KPI
    private boolean closed;

    @KPI
    private boolean completed;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "batch")
    @Output@UseTable
    private List<BatchFreeTextLine> freeTexts = new ArrayList<>();

    public void setFreeTexts(List<BatchFreeTextLine> freeTexts) {
        this.freeTexts = freeTexts;
        sum();
    }

    private void sum() {
        double tv = 0;
        double tc = 0;
        boolean allOk = true;
        for (BatchFreeTextLine l : freeTexts) {
            if (l.getValue() != null) tv += l.getValue();
            if (l.getCost() != null) tc += l.getCost();
            else allOk = false;
        }
        totalSale = Helper.roundEuros(tv);
        totalCost = Helper.roundEuros(tc);
        completed = allOk;
    }

    /*
    @Section("Generics")
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "batch")
    private List<BatchFreeTextLine> generics = new ArrayList<>();

    @Section("Transfers")
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "batch")
    private List<BatchFreeTextLine> transfers = new ArrayList<>();

    @Section("Hotels")
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "batch")
    private List<BatchFreeTextLine> hotels = new ArrayList<>();

    @Section("Excursions")
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "batch")
    private List<BatchFreeTextLine> excursions = new ArrayList<>();

     */


    @Action(order = 1, icon = VaadinIcons.EDIT)
    public TicketBatchForm enterVouchers() {
        return new TicketBatchForm(this);
    }

    public boolean isEnterVouchersVisible() {
        return !closed;
    }

    @Action(order = 1, icon = VaadinIcons.LOCK, saveBefore = true, saveAfter = true)
    public void close() throws Throwable {
        for (int i = 0; i < freeTexts.size(); i++) freeTexts.get(i).check(i);
        closed = true;
    }

    public boolean isCloseVisible() {
        return !closed;
    }

    @Action(order = 2, icon = VaadinIcons.EDIT)
    public TicketCompleteForm complete() {
        return new TicketCompleteForm(this);
    }

    public boolean isCompleteVisible() {
        return closed && !completed;
    }





    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null  && id > 0 && obj instanceof Batch && id == ((Batch) obj).getId());
    }

    @Override
    public String toString() {
        return "Batch " + id;
    }

    @Override
    public String getChangesSignature() {
        return "" + totalSale + "-" + totalCost + "-" + closed + "-" + completed;
    }
}
