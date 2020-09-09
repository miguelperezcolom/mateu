package io.mateu.showcase.tester.model.useCases.bankAccount;

import io.mateu.mdd.core.annotations.UseLinkToListView;

import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

@MateuMDDEntity
public class Bank {

    @Id@GeneratedValue
    private long id;

    @NotEmpty
    private final String name;

    private String country;

    @OneToMany(mappedBy = "bank")
    @UseLinkToListView(addEnabled = true, fields = "name,balance")
    private List<BankAccount> accounts = new ArrayList<>();


    @Override
    public String toString() {
        return getName();
    }

}
