package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.ui.CssLayout;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.reflection.FieldInterfaced;
import lombok.Builder;
import lombok.Getter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Builder@Getter
public class FormLayoutBuilderParameters {

    @Builder.Default
    private Map<HasValue, java.util.List<Validator>> validators = new HashMap<>();
    @Builder.Default
    private List<FieldInterfaced> allFields = new ArrayList<>();
    @Builder.Default
    private boolean createSections = true;
    @Builder.Default
    private boolean forSearchFilters = false;
    @Builder.Default
    private boolean forSearchFiltersExtended = false;
    @Builder.Default
    private boolean createTabs = true;
    private CssLayout links;
    @Builder.Default
    private Map<String, List<AbstractAction>> actionsPerSection = new HashMap<>();

}
