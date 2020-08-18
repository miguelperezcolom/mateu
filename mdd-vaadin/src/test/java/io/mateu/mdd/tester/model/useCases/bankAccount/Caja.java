package io.mateu.mdd.tester.model.useCases.bankAccount;

import lombok.MateuMDDEntity;

@MateuMDDEntity
public class Caja extends BankAccount {

    public Caja(Bank bank) {
        super(bank);
    }
}
