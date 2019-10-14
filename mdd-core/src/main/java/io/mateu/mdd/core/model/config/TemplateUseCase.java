package io.mateu.mdd.core.model.config;

import lombok.MateuMDDEntity;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.NotEmpty;

@MateuMDDEntity
public class TemplateUseCase {

    @NotEmpty
    private String name;

}
