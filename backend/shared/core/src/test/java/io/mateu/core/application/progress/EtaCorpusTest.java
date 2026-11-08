package io.mateu.core.application.progress;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.dtos.ProgressDto;
import io.mateu.dtos.ProgressStateDto;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;

/**
 * The server's ETA of a task follows conformance/progress/eta.json — the same corpus the .NET and
 * Python ports run, so a task estimates the same whichever backend runs it.
 */
class EtaCorpusTest {

  private static final ObjectMapper JSON = new ObjectMapper();

  private static JsonNode corpus() throws Exception {
    var file =
        Path.of(System.getProperty("user.dir"))
            .resolve("../../../conformance/progress/eta.json")
            .normalize();
    return JSON.readTree(file.toFile());
  }

  @TestFactory
  List<DynamicTest> theEstimateFollowsTheCorpus() throws Exception {
    var tests = new ArrayList<DynamicTest>();
    for (var c : corpus().get("cases")) {
      tests.add(
          DynamicTest.dynamicTest(
              c.get("name").asText(),
              () -> {
                var estimator = new EtaEstimator();
                var actual = new ArrayList<Integer>();
                var expected = new ArrayList<Integer>();
                for (int i = 0; i < c.get("samples").size(); i++) {
                  var s = c.get("samples").get(i);
                  var progress =
                      ProgressDto.builder()
                          .taskId("t")
                          .fraction(s.hasNonNull("fraction") ? s.get("fraction").asDouble() : null)
                          .done(s.hasNonNull("done") ? s.get("done").asInt() : null)
                          .total(s.hasNonNull("total") ? s.get("total").asInt() : null)
                          .state(
                              s.hasNonNull("state")
                                  ? ProgressStateDto.valueOf(s.get("state").asText())
                                  : ProgressStateDto.running)
                          .build();
                  actual.add(estimator.observe(progress, s.get("t").asLong()));
                  var e = c.get("expected").get(i);
                  expected.add(e.isNull() ? null : e.asInt());
                }
                assertThat(actual).isEqualTo(expected);
              }));
    }
    return tests;
  }
}
