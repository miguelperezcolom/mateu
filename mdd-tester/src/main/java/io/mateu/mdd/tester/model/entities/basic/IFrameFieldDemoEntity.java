package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.Html;
import io.mateu.mdd.core.annotations.IFrame;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
@Getter@Setter
public class IFrameFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    private String value = "http://demo.vaadin.com/sampler/";

    /*
    Some sites send the X-Frame-Options: SAMEORIGIN header to prevent
    their content to be displayed in sites from a different domain.
    That's the case of google.com.

     */

    @IFrame
    private transient String url;

    public String getUrl() {
        return value;
    }


}
