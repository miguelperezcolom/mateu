package io.mateu.mdd.core.model.config;

import io.mateu.mdd.core.annotations.TextArea;
import io.mateu.mdd.core.annotations.UseCheckboxes;
import lombok.MateuMDDEntity;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by miguel on 21/1/17.
 */
@MateuMDDEntity
public class Template {

    @OneToMany
    @UseCheckboxes
    private Set<TemplateUseCase> useCases = new HashSet<>();

    @NotNull
    private String name;

    private String subject;

    @TextArea
    private String freemarker;

}
