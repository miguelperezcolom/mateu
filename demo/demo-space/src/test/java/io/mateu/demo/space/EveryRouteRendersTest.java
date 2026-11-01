package io.mateu.demo.space;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Every route of routes.yaml answers with its YAML page. A definition the loader cannot read (a typo
 * in a key's shape, an unknown type) makes its route answer "Page not found" — with the reason only
 * in the log — so this is what catches it before a browser does. It needs no space-service: a page's
 * structure is served by Mateu; only the browser calls the API.
 */
@SpringBootTest
@AutoConfigureMockMvc
class EveryRouteRendersTest {

  @Autowired private MockMvc mvc;

  @ParameterizedTest
  @ValueSource(strings = {
    "welcome", "dashboard", "search", "budget", "credits",
    "missions", "missions/new", "missions/6", "missions/6/edit", "mission-control", "plan", "timeline",
    "board", "tasks", "tasks/new", "tasks/1",
    "calendar", "launches", "sites-map", "launch-sites", "launch-sites/4", "launch-sites/4/edit",
    "astronauts", "astronauts/5", "astronauts/5/edit",
    "spacecraft", "spacecraft/26", "components",
    "bodies", "bodies/10", "solar-system"
  })
  void routeRendersItsPage(String route) throws Exception {
    mvc.perform(post("/mateu/v3/sync/" + route)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"serverSideType":"","appState":{},"initiatorComponentId":"ux_root_",
                 "consumedRoute":"","route":"/%s","actionId":""}""".formatted(route)))
        .andExpect(status().isOk())
        .andExpect(content().string(not(containsString("\"type\":\"NotFound\""))))
        .andExpect(content().string(containsString("\"fragments\":[{")));
  }

  @org.junit.jupiter.api.Test
  void anUnknownRouteIsNotFound() throws Exception {
    // the negative case, so the assertion above is known to bite
    mvc.perform(post("/mateu/v3/sync/no-such-page")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"serverSideType":"","appState":{},"initiatorComponentId":"ux_root_",
                 "consumedRoute":"","route":"/no-such-page","actionId":""}"""))
        .andExpect(content().string(containsString("\"type\":\"NotFound\"")));
  }
}
