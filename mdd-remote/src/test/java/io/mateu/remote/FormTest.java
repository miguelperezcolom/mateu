package io.mateu.remote;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class FormTest {

    @Autowired
    private MockMvc mockMvc;


    @Test
    public void returns404() throws Exception {
        mockMvc.perform(get("/mateu/v1/uis/xxx")).andExpect(status().is4xxClientError());
    }


    @Test
    public void returnsUI() throws Exception {
        MvcResult result = mockMvc.perform(get("/mateu/v1/uis/io.mateu.remote.sampleui.MyUi"))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(status().is2xxSuccessful())
                .andReturn();
        String content = result.getResponse().getContentAsString();
        System.out.println(content);
    }

    @Test
    public void returnsView() throws Exception {
        MvcResult result = mockMvc.perform(get("/mateu/v1/uis/io.mateu.remote.sampleui.MyUi"))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(status().is2xxSuccessful())
                .andReturn();
        String content = result.getResponse().getContentAsString();
        System.out.println(content);
    }

}
