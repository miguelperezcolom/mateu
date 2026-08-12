package io.mateu.core.application.openapi;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.List;

/**
 * Checks a server's OpenAPI against the one the UI implies.
 *
 * <p>Emitting the derived spec is useful; <b>verifying</b> against it is where the value is. A file
 * has to be looked at. A check runs on its own, needs nothing regenerated, works the same whether
 * the server is Java, .NET, Python or somebody else's — and, unlike code generation, it detects
 * drift in <b>both</b> directions: the server changing a response the screens read, and the screens
 * starting to need something the server does not offer.
 *
 * <p>It only asserts the lower bound the UI actually knows: that every declared path exists with
 * the declared method, and that the parameters the screens interpolate are accepted. It
 * deliberately says nothing about error codes, auth or schemas — a check that failed on things the
 * UI cannot know would be reporting noise, and a check that reports noise gets ignored.
 */
public final class ApiContractCheck {

  private ApiContractCheck() {}

  /** One thing the UI needs and the server's spec does not offer. */
  public record Gap(String path, String method, String detail) {
    @Override
    public String toString() {
      return method.toUpperCase() + " " + path + " — " + detail;
    }
  }

  /**
   * The gaps between what the UI needs ({@code required}, from {@link OpenApiEmitter}) and what a
   * server's OpenAPI offers ({@code offered}). Empty means the server satisfies the UI.
   */
  public static List<Gap> check(JsonNode required, JsonNode offered) {
    var gaps = new ArrayList<Gap>();
    var requiredPaths = required.path("paths");
    var offeredPaths = offered.path("paths");

    requiredPaths
        .fieldNames()
        .forEachRemaining(
            path -> {
              var offeredItem = offeredPaths.path(path);
              if (offeredItem.isMissingNode()) {
                requiredPaths
                    .get(path)
                    .fieldNames()
                    .forEachRemaining(
                        method ->
                            gaps.add(new Gap(path, method, "the API does not declare this path")));
                return;
              }
              requiredPaths
                  .get(path)
                  .fieldNames()
                  .forEachRemaining(
                      method -> {
                        var offeredOperation = offeredItem.path(method);
                        if (offeredOperation.isMissingNode()) {
                          gaps.add(
                              new Gap(
                                  path, method, "the API declares the path but not this method"));
                          return;
                        }
                        var accepted = new ArrayList<String>();
                        offeredOperation
                            .path("parameters")
                            .forEach(p -> accepted.add(p.path("name").asText()));
                        requiredPaths
                            .get(path)
                            .get(method)
                            .path("parameters")
                            .forEach(
                                p -> {
                                  var name = p.path("name").asText();
                                  if (!accepted.contains(name)) {
                                    gaps.add(
                                        new Gap(
                                            path,
                                            method,
                                            "the screens send '"
                                                + name
                                                + "' and the API does not accept it"));
                                  }
                                });
                      });
            });
    return gaps;
  }
}
