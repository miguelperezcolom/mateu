package com.example.demoremote;

import io.mateu.remote.dtos.Form;
import io.mateu.util.Helper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

}
