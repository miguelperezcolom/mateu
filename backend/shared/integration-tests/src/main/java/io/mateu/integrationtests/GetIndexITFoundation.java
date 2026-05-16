package io.mateu.integrationtests;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;

public class GetIndexITFoundation {

  public void getsIndex() {
    given().when().get("/travel").then().statusCode(200).body(containsString("Travel app"));
  }
}
