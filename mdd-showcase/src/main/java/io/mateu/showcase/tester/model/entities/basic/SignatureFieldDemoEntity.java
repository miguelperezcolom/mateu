package io.mateu.showcase.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.Signature;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;

@MateuMDDEntity
public class SignatureFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    @Signature
    private String signature;


}
