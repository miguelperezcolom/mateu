package io.mateu.remote;

import io.mateu.core.application.NotFoundException;
import io.mateu.core.domain.MateuService;
import io.mateu.remote.dtos.JourneyCreationRq;
import io.mateu.remote.dtos.StepWrapper;
import io.mateu.util.Serializer;
import lombok.SneakyThrows;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.test.StepVerifier;

@SpringBootTest
//@AutoConfigureWebTestClient
public class FormTest {

  //@Autowired private WebTestClient webTestClient;
  @Autowired private MateuService mateuService;


  @Test
  public void createJourneyForNonExistingClassThrowsNotFound() throws Throwable {
    //given
    ServerHttpRequest request = MockServerHttpRequest.method(HttpMethod.POST, "").build();
    JourneyCreationRq creationRq = JourneyCreationRq.builder().build();

    //when
    Assertions.assertThrows(NotFoundException.class, () -> {
      var mono = mateuService
              .createJourneyAndReturn("non_existing_class_name", "zz", creationRq,  request);
      var r = mono.block();
      System.out.println(r);
    });

    //then
  }

  @Test
  public void createJourneyForExistingClassReturnsTheExpectedStep() throws Throwable {
    //given
    ServerHttpRequest request = MockServerHttpRequest.method(HttpMethod.POST, "").build();
    JourneyCreationRq creationRq = JourneyCreationRq.builder().build();
    String expectedJson = """
            {
            
            "journey" : {
                "type" : "io.mateu.remote.sampleui.MyUi",
                "status" : "Pending"
              }
            
            }
            """;

    //when
      var mono = mateuService
              .createJourneyAndReturn("io.mateu.remote.sampleui.MyUi", "yy", creationRq,  request);
      var stepWrapper = mono.block();

    //then
    JSONAssert.assertEquals(expectedJson, toJson(stepWrapper), false);
  }

  @SneakyThrows
  private String toJson(Object object) {
    return new Serializer().toJson(object);
  }

 }
