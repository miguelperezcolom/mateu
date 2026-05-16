package io.mateu.mdd.demoadminpanel.infra.in.ui.changes;

import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.TitleSupplier;
import lombok.NoArgsConstructor;

@FormLayout(columns = 1)
@Style("max-width:1300px;margin: auto;")
@NoArgsConstructor
public class ComparisonResultPage implements TitleSupplier {

    @Hidden
    String page;

    @Stereotype(FieldStereotype.html)
    String changes;

    ComparisonResultPage(ComparisonResult result) {
        this.page = result.page();
        this.changes = """
    <div onclick="let img = this.lastElementChild; img.style.opacity = (img.style.opacity == '0' ? '1' : '0')"
         style="position: relative; width: fit-content; cursor: pointer; border: 1px solid #ccc; line-height: 0; user-select: none; background-color: #f0f0f0;">
    
        <img src="%s" 
             style="display: block; max-width: 100%%; height: auto;" 
             alt="Base">
    
        <img style="position: absolute; top: 0; left: 0; width: 100%%; height: 100%%; opacity: 1; transition: opacity 0.2s ease-in-out; pointer-events: none;" 
             src="%s" 
             alt="Mascara">
    
    </div>
    """.formatted(result.diffUrl(), result.transparentMaskedUrl());
    }


    @Toolbar
    Object backToList() {
        return MateuBeanProvider.getBean(Changes.class);
    }

    @Override
    public String title() {
        return "Changes on " + page;
    }
}
