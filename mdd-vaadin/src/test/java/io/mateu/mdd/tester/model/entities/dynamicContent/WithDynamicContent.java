package io.mateu.mdd.tester.model.entities.dynamicContent;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
@Getter@Setter
public class WithDynamicContent {

    @Id
    @GeneratedValue
    private long id;


    private String name;

    @Convert(converter = DynamicContentConverter.class)
    private DynamicContent dynamicContent;

}
