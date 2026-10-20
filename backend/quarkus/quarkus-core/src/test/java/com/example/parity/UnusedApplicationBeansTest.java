package com.example.parity;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.eclipse.microprofile.config.ConfigProvider;
import org.junit.jupiter.api.Test;

/**
 * Mateu reaches the application's views only by reflection, so ArC finds no injection point for
 * them and, by default, removes them — and the services only they inject — as unused beans: Mateu
 * then created the view with {@code new} and its {@code @Inject} fields stayed null. The adapter
 * ships {@code quarkus.arc.remove-unused-beans=fwk} as a default (META-INF/microprofile-config
 * .properties), which keeps every bean declared in the application's code.
 *
 * <p>In test mode ArC never removes the beans declared in test sources, so the removal itself is
 * not reproducible here (it was verified against an application): this pins that Quarkus picks the
 * default up from the jar, and the injection path it protects.
 */
@QuarkusTest
class UnusedApplicationBeansTest {

  @Test
  void keepsTheApplicationsBeansEvenWhenNothingInjectsThem() {
    assertEquals(
        "fwk",
        ConfigProvider.getConfig().getValue("quarkus.arc.remove-unused-beans", String.class));
  }

  @Test
  void anActionOfAViewBeanReachesTheServiceOnlyItInjects() {
    given()
        .contentType(ContentType.JSON)
        .body(
            "{\"route\": \"\", \"consumedRoute\": \"_empty\", \"actionId\": \"greet\","
                + " \"componentState\": {}, \"parameters\": {}, \"appState\": {}}")
        .when()
        .post("/injected/mateu/v3/sync/_no_route")
        .then()
        .statusCode(200)
        .body(containsString("Hello from the service"))
        .body(not(containsString("Something went wrong")));
  }
}
