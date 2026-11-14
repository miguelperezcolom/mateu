package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.UI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The read filter follows every shape a nested object travels in, not only the declared type of a
 * field or a {@code List<X>} (GA review round 2, J5): the values of a {@code Map<String, X>}, an
 * {@code X[]}, an {@code Optional<X>}, and a subclass held in a base-typed field or list are
 * filtered by their own rules.
 */
class ReadFilterShapesSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .registerModule(new com.fasterxml.jackson.datatype.jdk8.Jdk8Module())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  public static class Pay {
    public double salary = 100;

    @EyesOnly(roles = "manager")
    public String secretNote = "TOP-SECRET-NOTE";
  }

  public static class Base {
    public String label = "base";
  }

  public static class Derived extends Base {
    @EyesOnly(roles = "manager")
    public String derivedSecret = "DERIVED-SECRET";
  }

  @UI("/read-shapes")
  public static class Shapes {
    public String name = "x";
    public Map<String, Pay> payMap = new LinkedHashMap<>(Map.of("a", new Pay()));
    public Pay[] payArr = new Pay[] {new Pay()};
    public Optional<Pay> payOpt = Optional.of(new Pay());
    public Base poly = new Derived();
    public List<Base> polyList = new ArrayList<>(List.of(new Derived()));
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Shapes.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static String load(String... roles) {
    return JSON.valueToTree(
            mateu.run(
                RunActionRqDto.builder()
                    .route("/read-shapes")
                    .consumedRoute("/read-shapes")
                    .serverSideType(Shapes.class.getName())
                    .actionId("")
                    .componentState(Map.of())
                    .build(),
                roles.length == 0 ? Map.of() : TestIdentities.headersWithRoles(roles)))
        .toString();
  }

  @Test
  void noShapeCarriesAFieldTheCallerMayNotRead() {
    var anonymous = load();
    assertThat(anonymous).doesNotContain("TOP-SECRET-NOTE").doesNotContain("DERIVED-SECRET");
    var manager = load("manager");
    assertThat(manager).contains("TOP-SECRET-NOTE").contains("DERIVED-SECRET");
  }
}
