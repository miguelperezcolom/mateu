package io.mateu.mdd.tester.model.entities.basic;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.Email;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

@Entity
@Getter@Setter
public class BasicFieldsWithValidationDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @NotNull
    private String requiredStringField = "zzzz";

    @Min(value = 18, message = "Age should not be less than 18")
    private long greaterThan19;

    @Email(message = "Must be a valid email")
    private String email;

}
