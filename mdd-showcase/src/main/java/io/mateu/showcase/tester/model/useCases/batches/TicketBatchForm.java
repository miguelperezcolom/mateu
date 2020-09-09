package io.mateu.showcase.tester.model.useCases.batches;

import io.mateu.mdd.core.annotations.Ignored;
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
public class TicketBatchForm implements EditorListener {

    @Ignored
    private final Batch batch;

    @Output
    private double total;

    @Output@SameLine
    private double totalCash;

    @Output@SameLine
    private double totalVisa;

    @OneToMany(cascade = CascadeType.ALL)
    private List<TicketBatchLine> lines = new ArrayList<>();

    public TicketBatchForm(Batch batch) {
        this.batch = batch;
        batch.getFreeTexts().forEach(l -> lines.add(new TicketBatchLine(this, l)));
        for (int i = lines.size(); i < 20; i++) lines.add(new TicketBatchLine(this));
    }

    public void updateTotals() {
        double t = 0;
        double tc = 0;
        double tv = 0;
        for (TicketBatchLine l : lines) {
            if (l.getValue() != null) t += l.getValue();
            if (l.getCash() != null) tc += l.getCash();
            if (l.getCreditCard() != null) tv += l.getCreditCard();
        }
        total = t;
        totalCash = tc;
        totalVisa = tv;
    }

    @Override
    public void preSave(Object model) throws Throwable {

    }

    @Override
    public void onSave(Object model) {

    }

    @Override
    public void onGoBack(Object model) {
        List<BatchFreeTextLine> fts = new ArrayList<>();
        lines.forEach(l -> {
            if (!l.isEmpty()) {
                if (l.getBatchLine() != null) {
                    l.getBatchLine().update(l);
                    fts.add(l.getBatchLine());
                } else {
                    fts.add(new BatchFreeTextLine(l));
                }
            }
        });
        fts.forEach(l -> l.setBatch(batch));
        batch.setFreeTexts(fts);
    }
}
