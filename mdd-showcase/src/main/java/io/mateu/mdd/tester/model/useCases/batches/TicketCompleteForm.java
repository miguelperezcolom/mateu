package io.mateu.mdd.tester.model.useCases.batches;

import io.mateu.mdd.core.annotations.ModifyValuesOnly;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.annotations.SameLine;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorListener;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.CascadeType;
import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@Getter@Setter
public class TicketCompleteForm implements EditorListener {

    private final Batch batch;
    @Output
    private double totalSale;

    @Output@SameLine
    private double totalCost;

    @OneToMany(cascade = CascadeType.ALL)@ModifyValuesOnly
    private List<TicketCompleteLine> lines = new ArrayList<>();

    public TicketCompleteForm(Batch batch) {
        this.batch = batch;
        batch.getFreeTexts().forEach(l -> lines.add(new TicketCompleteLine(this, l)));
    }

    public void updateTotals() {
        double tc = 0;
        double tv = 0;
        for (TicketCompleteLine l : lines) {
            if (l.getValue() != null) tv += l.getValue();
            if (l.getCost() != null) tc += l.getCost();
        }
        totalSale = tv;
        totalCost = tc;
    }

    @Override
    public void preSave(Object model) throws Throwable {

    }

    @Override
    public void onSave(Object model) {

    }

    @Override
    public void onGoBack(Object model) {
        for (TicketCompleteLine line : lines) {
            line.getBatchLine().setCost(line.getCost());
        }
        batch.setFreeTexts(new ArrayList<>(batch.getFreeTexts()));
    }
}
