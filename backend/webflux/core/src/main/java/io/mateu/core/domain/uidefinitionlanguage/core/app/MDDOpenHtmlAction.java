package io.mateu.core.domain.uidefinitionlanguage.core.app;

public class MDDOpenHtmlAction extends AbstractAction {

  public final String html;

  public MDDOpenHtmlAction(String name, String html) {
    super(name);
    this.html = html;
  }

  @Override
  public String toString() {
    return "Home";
  }
}
