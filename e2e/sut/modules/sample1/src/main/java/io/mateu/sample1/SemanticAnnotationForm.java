package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import lombok.Getter;
import lombok.Setter;

@UI("/semantic-annotations")
@Title("Semantic Annotation Form")
@Getter
@Setter
public class SemanticAnnotationForm {

    // A single domain annotation that bundles @Label + @Help.
    @Label("Product Name")
    @Help("The public product display name")
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.FIELD)
    public @interface ProductName {}

    // A domain annotation that composes a single @Stereotype.
    @Stereotype(FieldStereotype.password)
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.FIELD)
    public @interface Secret {}

    @ProductName
    String productName;

    @Secret
    String apiKey;

    // Control: a plain field, no semantic annotation.
    String plain;

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
