package br.com.painel.rm;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RmControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void listsProjects() throws Exception {
        mvc.perform(get("/rm/projects"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].externalId").exists());
    }

    @Test
    void returns404ForUnknownProject() throws Exception {
        mvc.perform(get("/rm/projects/zzz")).andExpect(status().isNotFound());
    }
}
