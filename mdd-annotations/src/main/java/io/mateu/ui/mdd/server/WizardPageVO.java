package io.mateu.ui.mdd.server;

import io.mateu.ui.core.shared.Data;

/**
 * Created by miguel on 23/4/17.
 */
public class WizardPageVO extends Data {

    public void setTitle(String v) {
        set("_title", v);
    }

    public String getTitle() {
        return get("_title");
    }


    public void setWizardClassName(String v) {
        set("_wizardclassname", v);
    }

    public String getWizardClassName() {
        return get("_wizardclassname");
    }


    public void setMetaData(Data v) {
        set("_metadata", v);
    }

    public Data getMetaData() {
        return get("_metadata");
    }

    public void setInitalData(Data v) {
        set("_initialdata", v);
    }

    public Data getInitialData() {
        return get("_initialdata");
    }

    public void setData(Data v) {
        set("_data", v);
    }

    public Data getData() {
        return get("_data");
    }

    public void setFirstPage(boolean v) {
        set("_firstpage", v);
    }

    public boolean isFirstPage() {
        return get("_firstpage");
    }

    public void setLastPage(boolean v) {
        set("_lastpage", v);
    }

    public boolean isLastPage() {
        return get("_lastpage");
    }

    public void setGoNextAction(String v) {
        set("_gonextaction", v);
    }

    public String getGoNextAction() {
        return get("_gonextaction");
    }

    public void setGoBackAction(String v) {
        set("_gobackaction", v);
    }

    public String getGoBackAction() {
        return get("_gobackaction");
    }


}
