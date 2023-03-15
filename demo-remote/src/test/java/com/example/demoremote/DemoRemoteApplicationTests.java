package com.example.demoremote;

import io.mateu.util.Helper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest
@AutoConfigureMockMvc
class DemoRemoteApplicationTests {

    @Autowired
    MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    void testGetUi() throws Exception {
        // given
        String expectedJson =
                Helper.leerInputStream(getClass().getResourceAsStream("/responses/ui.json"), "utf-8");

        // when
        MvcResult mvcResult =
                mockMvc.perform(MockMvcRequestBuilders.get("/mateu/v1/uis/com.example.demoremote.MyForm"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andReturn();

        // then
        assertEquals(normalize(expectedJson), normalize(mvcResult.getResponse().getContentAsString()));
    }

    public String normalize(String json) throws IOException {
        return Helper.toJson(Helper.fromJson(json));
    }

    @Autowired
    TeamsProvider teamsProvider;

    @Autowired
    RestTemplate restTemplate;

    @Test
    void testItemsProvider() {

        List characters = teamsProvider.find("49", 0, 100);

        assertTrue(characters.size() > 0);

    }


}
