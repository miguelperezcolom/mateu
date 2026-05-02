package io.mateu.mdd.demoadminpanel.infra.in.ui.nestedcrud;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.DetailFormCustomisation;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.data.FormPosition;
import io.mateu.uidl.interfaces.Identifiable;

import java.util.List;

@Style(StyleConstants.FULLWIDTH_PADDED)
public record Level1View(
        String id,
        String name,
        @Colspan(2)
        @DetailFormCustomisation(columns = 1, position = FormPosition.modal)
        List<Level2View> level2) implements Identifiable {

        @Override
        public String toString() {
                return id == null?"New Level1":name;
        }
}
