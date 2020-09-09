package io.mateu.showcase.tester.model.useCases.bankAccount;

import lombok.MateuMDDEntity;

@MateuMDDEntity
public class Caja extends BankAccount {

    public Caja(Bank bank) {
        super(bank);
    }
}
