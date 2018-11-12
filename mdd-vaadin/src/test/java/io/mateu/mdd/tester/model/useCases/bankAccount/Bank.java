package io.mateu.mdd.tester.model.useCases.bankAccount;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.validation.constraints.NotEmpty;

@Entity@Getter@Setter
public class Bank {

    @Id@GeneratedValue
    private long id;

    @NotEmpty
    private String name;

    private String country;


    @Override
    public String toString() {
        return getName();
    }

}
