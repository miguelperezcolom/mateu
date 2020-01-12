package io.mateu.mdd.tester.model.useCases.bankAccount;

import io.mateu.mdd.core.annotations.ListColumn;
import io.mateu.mdd.core.annotations.MainSearchFilter;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.annotations.Sum;
import io.mateu.mdd.core.model.authentication.Audit;
import lombok.MateuMDDEntity;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalTime;

@MateuMDDEntity
@Slf4j
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Embedded
    @Output
    @ListColumn(field = "created")
    @ListColumn(field = "createdBy.name")
    private Audit audit;

    @ManyToOne(cascade = CascadeType.MERGE)
    @MainSearchFilter(field = "searchableContent")
    @NotNull
    @ListColumn
    private BankAccount account;

    @Sum
    @ListColumn
    private double amount;


    @ListColumn
    private LocalTime time;







    public void setAmount(double amount) {
        log.debug("setAmount(" + amount + ")");
        double previousAmount = this.amount;
        this.amount = amount;
        log.debug("updating account balance as we have changed the amount");
        if (previousAmount != amount) getAccount().setBalance(getAccount().getBalance() + amount - previousAmount);
    }


    @PreRemove
    public void substractFromAccount() {
        getAccount().setBalance(getAccount().getBalance() - amount);
    }


    @Override
    public boolean equals(Object obj) {
        return this == obj || (id > 0 && obj instanceof Payment && id == ((Payment) obj).getId());
    }
}
