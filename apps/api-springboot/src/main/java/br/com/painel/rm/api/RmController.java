package br.com.painel.rm.api;

import br.com.painel.rm.domain.AnalystDto;
import br.com.painel.rm.domain.ProjectDto;
import br.com.painel.rm.domain.TimeEntryDto;
import br.com.painel.rm.mock.MockDataStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints que emulam o gateway do TOTVS RM.
 * Aderência SOLID: controller é uma fachada fina — regra de dados fica no store.
 */
@RestController
@RequestMapping("/rm")
public class RmController {

    private final MockDataStore store;

    public RmController(MockDataStore store) {
        this.store = store;
    }

    @GetMapping("/projects")
    public List<ProjectDto> listProjects() {
        return store.projects();
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<ProjectDto> getProject(@PathVariable String id) {
        return store.project(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/projects/{id}/time-entries")
    public List<TimeEntryDto> timeEntries(@PathVariable String id) {
        return store.entries(id);
    }

    @GetMapping("/analysts")
    public List<AnalystDto> analysts() {
        return store.analysts();
    }
}
