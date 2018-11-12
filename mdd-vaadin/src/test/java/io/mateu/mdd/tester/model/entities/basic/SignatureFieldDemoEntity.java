package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.Code;
import io.mateu.mdd.core.annotations.Signature;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
@Getter@Setter
public class SignatureFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    @Signature
    private String signature;


}
