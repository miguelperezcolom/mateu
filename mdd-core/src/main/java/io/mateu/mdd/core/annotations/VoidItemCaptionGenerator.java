package io.mateu.mdd.core.annotations;

import com.vaadin.ui.ItemCaptionGenerator;

public class VoidItemCaptionGenerator implements ItemCaptionGenerator {
    @Override
    public String apply(Object o) {
        return (o != null)?o.toString():null;
    }
}
