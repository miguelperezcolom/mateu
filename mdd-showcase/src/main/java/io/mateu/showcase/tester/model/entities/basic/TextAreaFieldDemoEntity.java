package io.mateu.showcase.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.TextArea;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;

@MateuMDDEntity
public class TextAreaFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @TextArea
    private String value = "zzzz";


}
