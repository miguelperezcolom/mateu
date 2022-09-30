package io.mateu.mdd.core.model.config;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.validation.constraints.NotEmpty;

@Entity
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class TemplateUseCase {

    @Id
    @GeneratedValue
    private long id;

    @NotEmpty
    private String name;

}
