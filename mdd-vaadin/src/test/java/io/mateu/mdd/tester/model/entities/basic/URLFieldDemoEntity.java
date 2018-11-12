package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.IFrame;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.net.URL;

@Entity
@Getter@Setter
public class URLFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    private URL value;


}
