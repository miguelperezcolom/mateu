package io.mateu.showcase.tester.model.entities.embedded;

import org.eclipse.persistence.config.DescriptorCustomizer;
import org.eclipse.persistence.descriptors.ClassDescriptor;

public class EmbeddableCustomizer implements DescriptorCustomizer {

    public void customize(ClassDescriptor descriptor) {
        descriptor.getInheritancePolicy().setClassIndicatorFieldName("EMBEDDED_TYPE");
        descriptor.getInheritancePolicy().addClassIndicator(EmbeddableSubclassedEntity1.class, "type 1");
        descriptor.getInheritancePolicy().addClassIndicator(EmbeddableSubclassedEntity1.class, "type 2");
    }
}
