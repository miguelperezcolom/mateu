package io.mateu.mdd.tester.model.entities.basic;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import java.net.URL;

@MateuMDDEntity
public class URLFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    private URL value;


}
