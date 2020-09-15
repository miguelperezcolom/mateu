package io.mateu.showcase.domain.boundedContexts.financial.model;

import io.mateu.showcase.domain.boundedContexts.common.model.Person;
import lombok.MateuMDDEntity;

import javax.persistence.CascadeType;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@MateuMDDEntity
public class Invoice {

    @NotNull
    private final String number = UUID.randomUUID().toString();

    @NotNull
    private final LocalDate date = LocalDate.now();

    @ManyToOne@NotNull
    private final Person recipient;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceLine> lines;

    private final double total;

}
