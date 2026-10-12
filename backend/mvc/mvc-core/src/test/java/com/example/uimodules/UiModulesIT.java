package com.example.uimodules;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import com.example.parity.ParityApp;
import io.mateu.integrationtests.AdapterParityITFoundation;
import io.mateu.thirdparty.ThirdPartyLibraryBean;
import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.ApplicationContext;

/**
 * A third-party Mateu UI module (its {@code @UI} classes, generated controllers and beans in a
 * package the application does not scan) is mounted only when the application names it.
 */
class UiModulesIT {

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @Nested
  @SpringBootTest(webEnvironment = RANDOM_PORT, classes = ParityApp.class)
  class NotNamed {

    @LocalServerPort Integer port;

    @BeforeEach
    void setUp() {
      RestAssured.port = port;
    }

    @Test
    void isNotServed() {
      contract.doesNotServeAnUnnamedThirdPartyUiModule();
    }
  }

  @Nested
  @SpringBootTest(
      webEnvironment = RANDOM_PORT,
      classes = ParityApp.class,
      properties = "mateu.ui.modules=io.mateu.thirdparty.ui, io.mateu.thirdparty")
  class ByProperty {

    @LocalServerPort Integer port;
    @Autowired ApplicationContext context;

    @BeforeEach
    void setUp() {
      RestAssured.port = port;
    }

    @Test
    void isServed() {
      contract.servesANamedThirdPartyUiModule();
    }

    @Test
    void theModulesOtherBeansAreRegisteredToo() {
      assertThat(context.getBeanNamesForType(ThirdPartyLibraryBean.class)).hasSize(1);
    }

    @Test
    void theApplicationsOwnUisKeepWorking() {
      contract.answersSyncWithJson();
    }
  }

  @Nested
  @SpringBootTest(webEnvironment = RANDOM_PORT, classes = ModulesApp.class)
  class ByAnnotation {

    @LocalServerPort Integer port;
    @Autowired ApplicationContext context;

    @BeforeEach
    void setUp() {
      RestAssured.port = port;
    }

    @Test
    void isServed() {
      contract.servesANamedThirdPartyUiModule();
    }

    @Test
    void onlyTheNamedPackageIsScanned() {
      // basePackageClasses = ThirdPartyHome → io.mateu.thirdparty.ui, not its parent package
      assertThat(context.getBeanNamesForType(ThirdPartyLibraryBean.class)).isEmpty();
    }
  }
}
