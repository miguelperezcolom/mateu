package io.mateu.core.domain.out.componentmapper;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.HashSet;
import java.util.Set;

/**
 * The page titles of this request that are DATA — a record's own {@code toString()} — rather than
 * strings the developer declared. The page mapper marks them on the wire ({@code
 * PageDto.titleIsText}) so a renderer that renders declared titles as HTML renders these as text:
 * otherwise anyone who can name a record plants markup (a tracking image, a phishing link) in the
 * header of everyone who opens it.
 */
public final class DataTitles {

  private static final String ATTRIBUTE = "mateu.dataTitles";

  private DataTitles() {}

  /** Remembers {@code title} as a data title of {@code httpRequest}; answers it unchanged. */
  @SuppressWarnings("unchecked")
  public static String mark(HttpRequest httpRequest, String title) {
    if (httpRequest == null || title == null || title.isBlank()) {
      return title;
    }
    var titles = (Set<String>) httpRequest.getAttribute(ATTRIBUTE);
    if (titles == null) {
      titles = new HashSet<>();
      httpRequest.setAttribute(ATTRIBUTE, titles);
    }
    titles.add(title);
    return title;
  }

  /** Whether {@code title} is one of {@code httpRequest}'s data titles. */
  @SuppressWarnings("unchecked")
  public static boolean isData(HttpRequest httpRequest, String title) {
    if (httpRequest == null || title == null) {
      return false;
    }
    var titles = (Set<String>) httpRequest.getAttribute(ATTRIBUTE);
    return titles != null && titles.contains(title);
  }
}
