package io.mateu.mdd.core.model.config;

import io.mateu.mdd.core.annotations.TextArea;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;

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

    //TODO: falta lista aplicaciones

    @NotNull
    private String name;

    @TextArea
    private String freemarker;

}
