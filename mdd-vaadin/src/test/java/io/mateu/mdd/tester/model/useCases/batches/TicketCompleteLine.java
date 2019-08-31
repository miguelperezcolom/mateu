package io.mateu.mdd.tester.model.useCases.batches;

import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.annotations.Output;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TicketCompleteLine {

    @Ignored
    private final TicketCompleteForm form;
    @Ignored
    private final BatchFreeTextLine batchLine;

    @Output
    private String provider;

    @Output
    private String service;

    @Output
    private LocalDate date;

    @Output
    private Double value;

    private Double cost;

    @Output
    private String comments;

    public TicketCompleteLine(TicketCompleteForm form, BatchFreeTextLine batchLine) {
        this.form = form;
        this.batchLine = batchLine;
        provider = batchLine.getProvider().getName();
        service = batchLine.getService();
        date = batchLine.getDate();
        value = batchLine.getValue();
        cost = batchLine.getCost();
        comments = batchLine.getComments();
        form.updateTotals();
    }
}
