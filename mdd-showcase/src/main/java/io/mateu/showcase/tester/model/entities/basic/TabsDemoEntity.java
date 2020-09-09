package io.mateu.showcase.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.EndTabs;
import io.mateu.mdd.core.annotations.StartTabs;
import io.mateu.mdd.core.annotations.Tab;

import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.validation.constraints.NotEmpty;

@MateuMDDEntity
public class TabsDemoEntity {

    @Id
    @GeneratedValue
    private long id;

    @NotEmpty
    private String name;


    @Tab(value = "First tab", fullWith = true)
    private String field1;

    private int field2;

    private boolean field3;


    @StartTabs
    @Tab("First nested tab")
    private String xfield1;

    private int xfield2;

    private boolean xfield3;


    @Tab("Second nested tab")
    private String xfield4;

    private String xfield5;

    private boolean xfield6;


    @Tab("Third nested tab")
    private String xfield7;

    private String xfield8;

    private boolean xfield9;


    @EndTabs
    @Tab("Second tab")
    private String field4;

    private String field5;

    private boolean field6;


    @Tab("Third tab")
    private String field7;

    private String field8;

    private boolean field9;


}
