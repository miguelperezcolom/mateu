package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main;

import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.insprod.InputRepository;
import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.insprod.JourneyRepository;
import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.insprod.Product;
import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.insprod.ProductRepository;
import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.sale.*;
import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.sale.Flow;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * the mission of the updater is to create and update the sale model from the insprod model
 */
@Service
public class Updater {

    @Autowired
    ProductRepository productRepository;
    @Autowired
    JourneyRepository journeyRepository;
    @Autowired
    InputRepository inputRepository;

    @Autowired
    ProcessRepository processRepository;
    @Autowired
    VariableRepository variableRepository;
    @Autowired
    StepRepository stepRepository;
    @Autowired
    SectionRepository sectionRepository;
    @Autowired
    FieldGroupRepository fieldGroupRepository;
    @Autowired
    FieldRepository fieldRepository;

    public void updateAll() {

        productRepository.findAll().forEach(product -> {
            updateProcess(product);
        });

    }

    private void updateProcess(Product product) {
        Optional<Flow> existingProcess = processRepository.findAll().stream()
                .filter(p -> p.getId().equals(product.getProcessId()))
                .findFirst();

        final Flow process;
        if (existingProcess.isPresent()) {
            process = existingProcess.get();
        } else {
            process = new Flow();
            process.setId(UUID.randomUUID().toString());
        }
        process.setName(product.getName());
        process.setActive("active".equals(product.getStatus()));
        processRepository.save(process);

        if (existingProcess.isEmpty()) {
            Step step = createStep(process);
            Section section = createSection(step);
            FieldGroup fieldGroup = createFieldGroup(section);
            createFields(product, fieldGroup);
        }
    }

    private void createFields(Product product, FieldGroup fieldGroup) {
        inputRepository.findAll().stream()
                .filter(i -> i.getJourney().getProduct().getKey().equals(product.getKey()))
                .forEach(i -> {
                    Field field = Field.builder()
                            .id(UUID.randomUUID().toString())
                            .fieldGroup(fieldGroup)
                            .key(i.getKey())
                            .label(i.getLabel())
                            .type(FieldType.String)
                            .build();
                    i.getValidations().forEach(v -> {
                        if (v.equals("required")) field.setRequired(true);
                        if (v.startsWith("dateFormat:")) field.setPattern(v.substring("dateFormat:".length()));
                        if (v.startsWith("between:")) {
                            v = v.substring("between:".length());
                            field.setMin(0);
                            field.setMax(10);
                            field.setSteps(0.01);
                        }
                        if (v.startsWith("in:")) field.setPossibleValues(
                                Arrays.stream(v.substring("in:".length()).split(","))
                                        .map(s -> s.trim())
                                        .collect(Collectors.toList())
                        );
                    });
                    fieldRepository.save(field);
                });
    }

    private FieldGroup createFieldGroup(Section section) {
        return fieldGroupRepository.save(FieldGroup.builder()
                .id(UUID.randomUUID().toString())
                .section(section)
                .title("Single field group")
                .build());
    }

    private Section createSection(Step step) {
        return sectionRepository.save(Section.builder()
                .id(UUID.randomUUID().toString())
                .step(step)
                .title("Single section")
                .build());
    }

    private Step createStep(Flow flow) {
        return stepRepository.save(Step.builder()
                        .id(UUID.randomUUID().toString())
                        .flow(flow)
                        .title("Single step")
                .build());
    }

}
