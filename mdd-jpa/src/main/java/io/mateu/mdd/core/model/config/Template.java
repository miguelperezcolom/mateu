package io.mateu.mdd.core.model.config;

import io.mateu.mdd.shared.annotations.TextArea;
import io.mateu.mdd.shared.annotations.UseCheckboxes;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by miguel on 21/1/17.
 */
@Entity
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class Template {

    @Id
    @GeneratedValue
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
