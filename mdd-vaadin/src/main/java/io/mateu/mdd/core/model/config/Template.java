package io.mateu.mdd.core.model.config;

import io.mateu.mdd.core.annotations.TextArea;
import io.mateu.mdd.core.annotations.UseCheckboxes;
import lombok.Getter;
import lombok.Setter;
import io.mateu.mdd.core.annotations.TextArea;
import io.mateu.mdd.core.annotations.UseCheckboxes;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by miguel on 21/1/17.
 */
@Entity
@Getter
@Setter
public class Template {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @OneToMany
    @UseCheckboxes
    private Set<TemplateUseCase> useCases = new HashSet<>();

    @NotNull
    private String name;

    private String subject;

    @TextArea
    private String freemarker;

}
