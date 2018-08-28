package io.mateu.mdd.tester.model.useCases.invoicing;

import io.mateu.mdd.core.annotations.SameLine;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.NotEmpty;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter@Setter
public class Customer {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotEmpty
    private String name;

    private String vatId;

    private boolean active;

    private LocalDateTime created;

    @SameLine
    private LocalDate expiry;


    @Override
    public String toString() {
        return getName();
    }
}
