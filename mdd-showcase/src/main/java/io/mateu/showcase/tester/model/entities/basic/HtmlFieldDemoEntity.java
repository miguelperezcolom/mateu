package io.mateu.showcase.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.Html;
import lombok.MateuMDDEntity;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;

@MateuMDDEntity
public class HtmlFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @Html
    private String value = "zzzz";


}
