package io.mateu.mdd.demoadminpanel.infra.in.ui.wf;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import static io.mateu.core.infra.JsonSerializer.pojoFromJson;

/**
 * Reads workflow definitions from JSON files located at classpath:/workflows/*.json.
 * Each file must contain a serialized {@link WorkflowDefinition}.
 * Active when workflow.persistence=memory.
 */
@Service
@ConditionalOnProperty(name = "workflow.persistence", havingValue = "memory", matchIfMissing = true)
@Slf4j
public class ClasspathWorkflowDefinitionRepository implements WorkflowDefinitionRepository {

    private final Map<String, WorkflowDefinition> definitions = new ConcurrentHashMap<>();

    public ClasspathWorkflowDefinitionRepository() {
        loadFromClasspath();
    }

    private static final ObjectMapper YAML_MAPPER = new YAMLMapper();

    private void loadFromClasspath() {
        var resolver = new PathMatchingResourcePatternResolver();
        try {
            var jsonResources = resolver.getResources("classpath:/workflows/*.json");
            var yamlResources = resolver.getResources("classpath:/workflows/*.{yaml,yml}");
            var resources = new java.util.ArrayList<Resource>();
            resources.addAll(Arrays.asList(jsonResources));
            resources.addAll(Arrays.asList(yamlResources));
            for (var resource : resources) {
                try {
                    String filename = resource.getFilename();
                    boolean isYaml = filename != null && (filename.endsWith(".yaml") || filename.endsWith(".yml"));
                    WorkflowDefinition def = isYaml
                            ? YAML_MAPPER.readValue(resource.getInputStream(), WorkflowDefinition.class)
                            : pojoFromJson(new String(resource.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8), WorkflowDefinition.class);
                    if (def.steps() != null) {
                        final String defId = def.id();
                        List<Step> stepsWithId = def.steps().stream()
                                .map(s -> s.withWorkflowDefinitionId(defId))
                                .toList();
                        def = new WorkflowDefinition(
                                def.id(), def.name(), def.version(), def.description(),
                                def.status(), def.draftOfId(), def.limitConcurrentExecutions(),
                                def.maxConcurrentExecutions(), def.enqueueOnLimit(),
                                stepsWithId);
                    }
                    definitions.put(def.id(), def);
                    log.info("Loaded workflow definition '{}' from classpath:{}", def.id(), resource.getFilename());
                } catch (Exception e) {
                    log.error("Failed to load workflow definition from classpath:{}", resource.getFilename(), e);
                }
            }
        } catch (IOException e) {
            log.warn("No workflow definitions found at classpath:/workflows/ — directory may not exist");
        }
    }

    @Override
    public Optional<WorkflowDefinition> findById(String id) {
        return Optional.ofNullable(definitions.get(id));
    }

    @Override
    public String save(WorkflowDefinition def) {
        definitions.put(def.id(), def);
        return def.id();
    }

    @Override
    public List<WorkflowDefinition> findAll() {
        return List.copyOf(definitions.values());
    }

    @Override
    public void deleteAllById(List<String> ids) {
        ids.forEach(definitions::remove);
    }
}
