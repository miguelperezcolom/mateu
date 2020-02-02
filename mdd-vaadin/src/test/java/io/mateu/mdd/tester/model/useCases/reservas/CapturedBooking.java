package io.mateu.mdd.tester.model.useCases.reservas;

import io.mateu.mdd.core.annotations.ListColumn;
import io.mateu.mdd.tester.model.useCases.bankAccount.BankAccount;
import lombok.MateuMDDEntity;

import javax.persistence.Column;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@MateuMDDEntity
public class CapturedBooking {

    @NotNull@ListColumn
    private LocalDateTime captured = LocalDateTime.now();

    @ManyToOne@NotNull@ListColumn
    private BankAccount provider;

    @NotEmpty@ListColumn
    private String leadName;

    @NotNull@ListColumn
    private LocalDate start;

    @NotNull@Column(name = "_end")@ListColumn
    private LocalDate end;

    @NotEmpty@ListColumn
    private String reference;

    @NotEmpty
    private String description;

    private String source;

    @ManyToOne
    private File1 booking;

}
