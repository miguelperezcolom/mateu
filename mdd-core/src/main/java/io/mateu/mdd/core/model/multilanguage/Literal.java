package io.mateu.mdd.core.model.multilanguage;

import io.mateu.mdd.core.data.Data;
import io.mateu.mdd.core.interfaces.Translated;
import lombok.Getter;
import lombok.MateuMDDEntity;
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
@Getter@Setter@MateuMDDEntity
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

    @Override
    public String toString() {
        return getEs();
    }

    public Literal(String en, String es) {
        this.en = en;
        this.es = es;
    }

    @Override
    public void set(Data value) {
        if (value != null) {
            setEs(value.get("es"));
            setEn(value.get("en"));
            setDe(value.get("de"));
            setFr(value.get("fr"));
            setIt(value.get("it"));
            setAr(value.get("ar"));
            setCz(value.get("cz"));
            setRu(value.get("ru"));
        } else {
            setEs(null);
            setEn(null);
            setDe(null);
            setFr(null);
            setIt(null);
            setAr(null);
            setCz(null);
            setRu(null);
        }
    }

    @Override
    public Data get() {
        Data d = new Data();
        if (getEs() != null) d.set("es", getEs());
        if (getEn() != null) d.set("en", getEn());
        if (getDe() != null) d.set("de", getDe());
        if (getFr() != null) d.set("fr", getFr());
        if (getIt() != null) d.set("it", getIt());
        if (getAr() != null) d.set("ar", getAr());
        if (getCz() != null) d.set("cz", getCz());
        if (getRu() != null) d.set("ru", getRu());
        return d;
    }

    public String get(String language) {
        Data d = get();
        return d.containsKey(language)?d.getString(language):d.getString("en");
    }

}
