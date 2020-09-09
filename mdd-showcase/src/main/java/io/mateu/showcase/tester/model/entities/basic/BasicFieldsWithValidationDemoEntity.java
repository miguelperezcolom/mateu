package io.mateu.showcase.tester.model.entities.basic;

import lombok.MateuMDDEntity;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.validation.constraints.Email;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;

@MateuMDDEntity
public class BasicFieldsWithValidationDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @NotEmpty
    private String requiredStringField = "zzzz";

    @Min(value = 18, message = "Age should not be less than 18")
    private long greaterThan19;

    @Email(message = "Must be a valid email")
    private String email;

}
