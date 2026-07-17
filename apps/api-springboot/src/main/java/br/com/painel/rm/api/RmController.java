package br.com.painel.rm.api;

import br.com.painel.rm.domain.AnalystDto;
import br.com.painel.rm.domain.ProjectDto;
import br.com.painel.rm.domain.RmEventDto;
import br.com.painel.rm.domain.TimeEntryDto;
import br.com.painel.rm.mock.MockDataStore;
import br.com.painel.rm.mock.RmEventGenerator;
import br.com.painel.rm.persistence.RmEventRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Endpoints que emulam o gateway do TOTVS RM.
 * Aderência SOLID: controller é uma fachada fina — regra de dados fica no store.
 */
@RestController
@RequestMapping("/rm")
public class RmController {
    private final MockDataStore store;
    private final RmEventRepository events;
    private final RmEventGenerator eventGenerator;

    public RmController(MockDataStore store, RmEventRepository events, RmEventGenerator eventGenerator) {
        this.store = store;
        this.events = events;
        this.eventGenerator = eventGenerator;
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

    @GetMapping("/events")
    public List<RmEventDto> events() {
        return events.findTop50ByOrderByOccurredAtDesc().stream().map(RmEventGenerator::toDto).toList();
    }

    @PostMapping("/events/generate")
    public RmEventDto generateEvent() {
        return eventGenerator.generate("Manual");
    }
}
