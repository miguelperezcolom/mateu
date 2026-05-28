package io.mateu.core.domain.out.fragmentmapper;

import java.util.Arrays;
import java.util.regex.Pattern;

final class RoutePatternAccumulator {

  static String accumulate(Pattern pattern, String route) {
    Pattern basePattern =
        Pattern.compile(pattern.pattern().substring(0, pattern.pattern().indexOf(".*")));
    StringBuilder accumulated = new StringBuilder();
    var matched = false;
    for (String token :
        Arrays.stream(route.split("/")).filter(token -> !"".equals(token)).toList()) {
      if ("".equals(basePattern.pattern())) {
        accumulated.append("/");
        break;
      }
      if (!basePattern.matcher(accumulated + "/" + token).matches()) {
        if (matched) {
          break;
        }
      } else {
        matched = true;
      }
      accumulated.append("/").append(token);
    }
    return matched ? accumulated.toString() : "/";
  }

  private RoutePatternAccumulator() {}
}
