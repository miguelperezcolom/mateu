package io.mateu.showcase.tester.model.entities.dynamicContent;

import javax.persistence.Convert;
import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;

@MateuMDDEntity
public class WithDynamicContent {

    @Id
    @GeneratedValue
    private long id;


    private String name;

    @Convert(converter = DynamicContentConverter.class)
    private DynamicContent dynamicContent;

}
