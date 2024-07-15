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
                "status" : "Pending",
                "statusMessage" : "Please fill the form",
                "currentStepId" : "form",
                "currentStepDefinitionId" : "io.mateu.remote.sampleui.MyUi"
              },
              "step" : {
                "id" : "form",
                "name" : "This is a sample form",
                "type" : "io.mateu.remote.sampleui.MyUi",
                "view" : {
                  "title" : null,
                  "subtitle" : null,
                  "messages" : [ ],
                  "header" : {
                    "classes" : null,
                    "components" : [ ]
                  },
                  "left" : {
                    "classes" : null,
                    "components" : [ ]
                  },
                  "main" : {
                    "classes" : null,
                    "components" : [ {
                      "metadata" : {
                        "type" : "Form",
                        "type" : "Form",
                        "dataPrefix" : "",
                        "icon" : null,
                        "title" : "This is a sample form",
                        "readOnly" : false,
                        "subtitle" : null,
                        "status" : null,
                        "badges" : [ ],
                        "tabs" : [ ],
                        "banners" : [ ],
                        "sections" : [ {
                          "id" : "section_0",
                          "tabId" : "",
                          "caption" : "",
                          "description" : "",
                          "readOnly" : false,
                          "type" : "Card",
                          "leftSideImageUrl" : "",
                          "topImageUrl" : "",
                          "actions" : [ ],
                          "fieldGroups" : [ {
                            "id" : "fieldgroup_1_0",
                            "caption" : "",
                            "lines" : [ {
                              "fields" : [ {
                                "id" : "name",
                                "type" : "string",
                                "stereotype" : "input",
                                "observed" : false,
                                "caption" : "Name",
                                "placeholder" : null,
                                "cssClasses" : null,
                                "description" : null,
                                "badges" : [ ],
                                "validations" : [ ],
                                "attributes" : [ ]
                              } ]
                            }, {
                              "fields" : [ {
                                "id" : "age",
                                "type" : "int",
                                "stereotype" : "input",
                                "observed" : false,
                                "caption" : "Age",
                                "placeholder" : null,
                                "cssClasses" : null,
                                "description" : null,
                                "badges" : [ ],
                                "validations" : [ ],
                                "attributes" : [ ]
                              } ]
                            }, {
                              "fields" : [ {
                                "id" : "assessment",
                                "type" : "string",
                                "stereotype" : "input",
                                "observed" : false,
                                "caption" : "Assessment",
                                "placeholder" : null,
                                "cssClasses" : null,
                                "description" : null,
                                "badges" : [ ],
                                "validations" : [ ],
                                "attributes" : [ ]
                              } ]
                            } ]
                          } ]
                        } ],
                        "actions" : [ {
                          "id" : "component-0___assess",
                          "caption" : "Assess",
                          "type" : "Primary",
                          "visible" : true,
                          "validationRequired" : true,
                          "confirmationRequired" : false,
                          "rowsSelectedRequired" : false,
                          "confirmationTexts" : {
                            "title" : "Please confirm",
                            "message" : "",
                            "action" : "Assess"
                          },
                          "target" : "SameLane",
                          "modalStyle" : "",
                          "customEvent" : "",
                          "href" : ""
                        } ],
                        "mainActions" : [ ],
                        "validations" : null
                      },
                      "id" : "component-0",
                      "attributes" : { }
                    } ]
                  },
                  "right" : {
                    "classes" : null,
                    "components" : [ ]
                  },
                  "footer" : {
                    "classes" : null,
                    "components" : [ ]
                  }
                },
                "data" : {
                  "name" : "Mateu",
                  "assessment" : null,
                  "age" : 0
                },
                "rules" : [ ],
                "previousStepId" : null
              },
              "store" : {
                "journeyId" : "yy",
                "journeyTypeId" : "io.mateu.remote.sampleui.MyUi",
                "remoteBaseUrl" : null,
                "remoteJourneyTypeId" : null,
                "journeyClass" : null,
                "journeyData" : null,
                "journey" : {
                  "type" : "io.mateu.remote.sampleui.MyUi",
                  "status" : "Pending",
                  "statusMessage" : "Please fill the form",
                  "currentStepId" : "form",
                  "currentStepDefinitionId" : "io.mateu.remote.sampleui.MyUi"
                },
                "steps" : {
                  "form" : {
                    "id" : "form",
                    "name" : "This is a sample form",
                    "type" : "io.mateu.remote.sampleui.MyUi",
                    "view" : {
                      "title" : null,
                      "subtitle" : null,
                      "messages" : [ ],
                      "header" : {
                        "classes" : null,
                        "components" : [ ]
                      },
                      "left" : {
                        "classes" : null,
                        "components" : [ ]
                      },
                      "main" : {
                        "classes" : null,
                        "components" : [ {
                          "metadata" : {
                            "type" : "Form",
                            "dataPrefix" : "",
                            "icon" : null,
                            "title" : "This is a sample form",
                            "readOnly" : false,
                            "subtitle" : null,
                            "status" : null,
                            "badges" : [ ],
                            "tabs" : [ ],
                            "banners" : [ ],
                            "sections" : [ {
                              "id" : "section_0",
                              "tabId" : "",
                              "caption" : "",
                              "description" : "",
                              "readOnly" : false,
                              "type" : "Card",
                              "leftSideImageUrl" : "",
                              "topImageUrl" : "",
                              "actions" : [ ],
                              "fieldGroups" : [ {
                                "id" : "fieldgroup_1_0",
                                "caption" : "",
                                "lines" : [ {
                                  "fields" : [ {
                                    "id" : "name",
                                    "type" : "string",
                                    "stereotype" : "input",
                                    "observed" : false,
                                    "caption" : "Name",
                                    "placeholder" : null,
                                    "cssClasses" : null,
                                    "description" : null,
                                    "badges" : [ ],
                                    "validations" : [ ],
                                    "attributes" : [ ]
                                  } ]
                                }, {
                                  "fields" : [ {
                                    "id" : "age",
                                    "type" : "int",
                                    "stereotype" : "input",
                                    "observed" : false,
                                    "caption" : "Age",
                                    "placeholder" : null,
                                    "cssClasses" : null,
                                    "description" : null,
                                    "badges" : [ ],
                                    "validations" : [ ],
                                    "attributes" : [ ]
                                  } ]
                                }, {
                                  "fields" : [ {
                                    "id" : "assessment",
                                    "type" : "string",
                                    "stereotype" : "input",
                                    "observed" : false,
                                    "caption" : "Assessment",
                                    "placeholder" : null,
                                    "cssClasses" : null,
                                    "description" : null,
                                    "badges" : [ ],
                                    "validations" : [ ],
                                    "attributes" : [ ]
                                  } ]
                                } ]
                              } ]
                            } ],
                            "actions" : [ {
                              "id" : "component-0___assess",
                              "caption" : "Assess",
                              "type" : "Primary",
                              "visible" : true,
                              "validationRequired" : true,
                              "confirmationRequired" : false,
                              "rowsSelectedRequired" : false,
                              "confirmationTexts" : {
                                "title" : "Please confirm",
                                "message" : "",
                                "action" : "Assess"
                              },
                              "target" : "SameLane",
                              "modalStyle" : "",
                              "customEvent" : "",
                              "href" : ""
                            } ],
                            "mainActions" : [ ],
                            "validations" : null
                          },
                          "id" : "component-0",
                          "attributes" : { }
                        } ]
                      },
                      "right" : {
                        "classes" : null,
                        "components" : [ ]
                      },
                      "footer" : {
                        "classes" : null,
                        "components" : [ ]
                      }
                    },
                    "data" : {
                      "name" : "Mateu",
                      "assessment" : null,
                      "age" : 0
                    },
                    "rules" : [ ],
                    "previousStepId" : null
                  }
                },
                "initialStep" : {
                  "id" : "form",
                  "name" : "This is a sample form",
                  "type" : "io.mateu.remote.sampleui.MyUi",
                  "view" : {
                    "title" : null,
                    "subtitle" : null,
                    "messages" : [ ],
                    "header" : {
                      "classes" : null,
                      "components" : [ ]
                    },
                    "left" : {
                      "classes" : null,
                      "components" : [ ]
                    },
                    "main" : {
                      "classes" : null,
                      "components" : [ {
                        "metadata" : {
                          "type" : "Form",
                          "dataPrefix" : "",
                          "icon" : null,
                          "title" : "This is a sample form",
                          "readOnly" : false,
                          "subtitle" : null,
                          "status" : null,
                          "badges" : [ ],
                          "tabs" : [ ],
                          "banners" : [ ],
                          "sections" : [ {
                            "id" : "section_0",
                            "tabId" : "",
                            "caption" : "",
                            "description" : "",
                            "readOnly" : false,
                            "type" : "Card",
                            "leftSideImageUrl" : "",
                            "topImageUrl" : "",
                            "actions" : [ ],
                            "fieldGroups" : [ {
                              "id" : "fieldgroup_1_0",
                              "caption" : "",
                              "lines" : [ {
                                "fields" : [ {
                                  "id" : "name",
                                  "type" : "string",
                                  "stereotype" : "input",
                                  "observed" : false,
                                  "caption" : "Name",
                                  "placeholder" : null,
                                  "cssClasses" : null,
                                  "description" : null,
                                  "badges" : [ ],
                                  "validations" : [ ],
                                  "attributes" : [ ]
                                } ]
                              }, {
                                "fields" : [ {
                                  "id" : "age",
                                  "type" : "int",
                                  "stereotype" : "input",
                                  "observed" : false,
                                  "caption" : "Age",
                                  "placeholder" : null,
                                  "cssClasses" : null,
                                  "description" : null,
                                  "badges" : [ ],
                                  "validations" : [ ],
                                  "attributes" : [ ]
                                } ]
                              }, {
                                "fields" : [ {
                                  "id" : "assessment",
                                  "type" : "string",
                                  "stereotype" : "input",
                                  "observed" : false,
                                  "caption" : "Assessment",
                                  "placeholder" : null,
                                  "cssClasses" : null,
                                  "description" : null,
                                  "badges" : [ ],
                                  "validations" : [ ],
                                  "attributes" : [ ]
                                } ]
                              } ]
                            } ]
                          } ],
                          "actions" : [ {
                            "id" : "component-0___assess",
                            "caption" : "Assess",
                            "type" : "Primary",
                            "visible" : true,
                            "validationRequired" : true,
                            "confirmationRequired" : false,
                            "rowsSelectedRequired" : false,
                            "confirmationTexts" : {
                              "title" : "Please confirm",
                              "message" : "",
                              "action" : "Assess"
                            },
                            "target" : "SameLane",
                            "modalStyle" : "",
                            "customEvent" : "",
                            "href" : ""
                          } ],
                          "mainActions" : [ ],
                          "validations" : null
                        },
                        "id" : "component-0",
                        "attributes" : { }
                      } ]
                    },
                    "right" : {
                      "classes" : null,
                      "components" : [ ]
                    },
                    "footer" : {
                      "classes" : null,
                      "components" : [ ]
                    }
                  },
                  "data" : {
                    "name" : "Mateu",
                    "assessment" : null,
                    "age" : 0
                  },
                  "rules" : [ ],
                  "previousStepId" : null
                },
                "created" : null,
//                "lastAccess" : "2024-03-31T12:50:58.678268",
                "lastUsedFilters" : { },
                "lastUsedSorting" : { }
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
