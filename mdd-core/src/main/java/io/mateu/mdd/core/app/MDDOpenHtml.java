package io.mateu.mdd.core.app;


public class MDDOpenHtml extends AbstractAction {

    public final String html;

    public MDDOpenHtml(String name, String html) {
        super(name);
        this.html = html;
    }

    @Override
    public String toString() {
        return "Home";
    }
}
