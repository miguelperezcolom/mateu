package io.mateu.mdd.tester.model.useCases.bankAccount;

import io.mateu.mdd.core.annotations.UseLinkToListView;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

@Entity@Getter@Setter
public class Bank {

    @Id@GeneratedValue
    private long id;

    @NotEmpty
    private String name;

    private String country;

    @OneToMany(mappedBy = "bank")
    @UseLinkToListView(addEnabled = true, fields = "name,balance")
    private List<BankAccount> accounts = new ArrayList<>();


    @Override
    public String toString() {
        return getName();
    }

}
