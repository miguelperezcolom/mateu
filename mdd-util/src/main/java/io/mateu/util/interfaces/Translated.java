package io.mateu.util.interfaces;


import io.mateu.util.data.Data;

/**
 * Created by miguel on 7/3/17.
 */
public interface Translated {

    void set(Data value);

    Data get();

    String getEs();

    String getEn();

    String getDe();

    String getFr();

    String getIt();

    String getAr();

    String getCz();

    String getRu();

    void setEn(String value);

    void setDe(String value);

    void setFr(String value);

    void setIt(String value);

    void setAr(String value);

    void setCz(String value);

    void setRu(String value);

    void setEs(String value);
}
