package io.mateu.showcase.tester.model.useCases.bankAccount;

import lombok.MateuMDDEntity;

@MateuMDDEntity
public class Banco extends BankAccount {

    public Banco(Bank bank) {
        super(bank);
    }

}
