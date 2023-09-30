package io.mateu.remote;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.test.web.reactive.server.WebTestClient;

@WebFluxTest
public class FormTest {

  @Autowired private WebTestClient webTestClient;

  @Test
  public void returns404() throws Exception {
    webTestClient.get().uri("/mateu/v1/uis/xxx").exchange().expectStatus().is4xxClientError();
  }

  /*

  @Test
  public void returnsUI() throws Exception {
      webTestClient.get().uri("/mateu/v1/uis/io.mateu.remote.sampleui.MyUi")
              .exchange()
              .expectStatus().is2xxSuccessful()
              .expectBody();
      String content = result.getResponse().getContentAsString();
      System.out.println(content);
  }

  @Test
  public void createsJourney() throws Exception {
      String journeyId = "journey1";

      createJourney(journeyId);

      Assertions.assertNotNull(JourneyStoreService.get().getJourney(journeyId));
  }

  private void createJourney(String journeyId) throws Exception {
      JourneyCreationRq rq = JourneyCreationRq.builder()
              .journeyTypeId("io.mateu.remote.sampleui.MyUi")
              .contextData(List.of())
              .build();
      MvcResult result = mockMvc.perform(post("/mateu/v1/journeys/" + journeyId)
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(Helper.toJson(rq)))
              .andDo(MockMvcResultHandlers.print())
              .andExpect(status().is2xxSuccessful())
              .andReturn();
      String content = result.getResponse().getContentAsString();
      System.out.println(content);
  }

  @Test
  public void returnsJourney() throws Exception {
      String journeyId = "journey2";
      createJourney(journeyId);

      MvcResult result = mockMvc.perform(get("/mateu/v1/journeys/" + journeyId))
              .andDo(MockMvcResultHandlers.print())
              .andExpect(status().is2xxSuccessful())
              .andReturn();
      String content = result.getResponse().getContentAsString();
      System.out.println(content);
  }

  @Test
  public void returnsStep() throws Exception {
      String journeyId = "journey3";
      createJourney(journeyId);
      Journey journey = JourneyStoreService.get().getJourney(journeyId);

      MvcResult result = mockMvc.perform(get("/mateu/v1/journeys/" + journeyId + "/steps/" + journey.getCurrentStepId()))
              .andDo(MockMvcResultHandlers.print())
              .andExpect(status().is2xxSuccessful())
              .andReturn();
      String content = result.getResponse().getContentAsString();
      System.out.println(content);
  }

  @Test
  public void runsAction() throws Exception {
      String journeyId = "journey4";
      createJourney(journeyId);
      Journey journey = JourneyStoreService.get().getJourney(journeyId);

      RunActionRq rq = RunActionRq.builder()
              .data(Map.of("name", "Mateu", "age", 14))
              .build();

      String actionId = "assess";

      MvcResult result = mockMvc.perform(post("/mateu/v1/journeys/" + journeyId + "/steps/" +
                      journey.getCurrentStepId() + "/" + actionId)
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(Helper.toJson(rq)))
              .andDo(MockMvcResultHandlers.print())
              .andExpect(status().is2xxSuccessful())
              .andReturn();
      String content = result.getResponse().getContentAsString();
      System.out.println(content);

      Step step = JourneyStoreService.get().getStep(journeyId, journey.getCurrentStepId());
      Assertions.assertTrue(Helper.toJson(step)
              .contains("Mateu, 14"));
      Object viewInstance = JourneyStoreService.get().getViewInstance(journeyId, journey.getCurrentStepId());
      Assertions.assertTrue(Helper.toJson(viewInstance)
              .contains("Mateu, 14"));

  }

   */
}
