package io.mateu.mdd.tester.model.useCases.bankAccount;

import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.model.authentication.Audit;
import io.mateu.mdd.core.model.authentication.User;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Entity
@Getter@Setter
public class BankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Embedded
    @Output
    private Audit audit;

    @ManyToOne@NotNull
    @Unmodifiable
    private Bank bank;

    @NotEmpty
    private String name;

    private String searchableContent;

    @ManyToOne
    @NotNull
    @Keep
    private User owner;

    @Output
    @Sum
    private double balance;


    @Override
    public String toString() {
        return getName();
    }
}
