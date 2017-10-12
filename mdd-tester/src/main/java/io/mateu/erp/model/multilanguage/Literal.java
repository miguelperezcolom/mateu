package io.mateu.erp.model.multilanguage;

import io.mateu.ui.mdd.server.interfaces.Translated;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

/**
 * holder for translations. Hardcoding translations is used for better performance
 *
 * Created by miguel on 13/9/16.
 */
@Entity
@Getter@Setter
public class Literal implements Translated {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String en;

    private String es;

    private String de;

    private String fr;

    private String it;

    private String ar;

    private String cz;

    private String ru;

    public Literal() {

    }

    public Literal(String en, String es) {
        this.en = en;
        this.es = es;
    }

    @Override
    public void set(String text) {
        setEs(text);
    }

    @Override
    public String get() {
        return getEs();
    }
}
