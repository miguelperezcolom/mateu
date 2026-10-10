package com.example.scan;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.SpringBeanProvider;
import io.mateu.core.application.MateuService;
import io.mateu.thirdparty.ThirdPartyLibraryBean;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

/**
 * An app that scans only its own package gets every Mateu bean through the adapter's
 * auto-configuration — and none of a third-party library that lives under {@code io.mateu.*}.
 */
@SpringBootTest(classes = MateuComponentScanTest.App.class)
class MateuComponentScanTest {

  @SpringBootApplication
  static class App {}

  @Autowired ApplicationContext context;

  @Test
  void mateusOwnBeansAreRegistered() {
    assertThat(context.getBeanNamesForType(MateuService.class)).isNotEmpty();
    assertThat(context.getBeanNamesForType(SpringBeanProvider.class)).isNotEmpty();
  }

  @Test
  void aThirdPartyLibraryUnderIoMateuIsNotSweptIn() {
    assertThat(context.getBeanNamesForType(ThirdPartyLibraryBean.class)).isEmpty();
  }
}
