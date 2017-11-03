package io.mateu.mdd.model.tests.basic;

import io.mateu.ui.core.shared.Data;
import io.mateu.ui.mdd.server.AbstractServerSideWizardPage;
import io.mateu.ui.mdd.server.ERPServiceImpl;
import io.mateu.ui.mdd.server.annotations.UseGridToSelect;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class Pagina3 extends AbstractServerSideWizardPage {

    @UseGridToSelect(data = "opciones")
    @NotNull
    private Option option;

    @Override
    public String getTitle() {
        return "Paso 3";
    }

    @Override
    public Data getData(Data in) throws Throwable {
        Data out = new Data();

        List<Data> l = new ArrayList<>();
        for (Option o : getOptions()) {
            Data d;
            l.add(d = new Data());
            ERPServiceImpl.fillData(d, o);
        }
        out.set("option_data", l);

        return out;
    }

    private List<Option> getOptions() {
        List<Option> l = new ArrayList<>();
        l.add(new Option("Palma", "Hotel Don Juan", "***", "2 pax in 1 Double room", "Bed & breakfast", 342.10, "EUR", "iwuedw98y23e237e2b3e23e7iy2dg39ew7293e2397et23igd2g3ed2g3et23798eg23=="));
        l.add(new Option("Palma", "Hotel Don Juan", "***", "2 pax in 1 Double room", "Half board", 510, "EUR", "iwuedw98y23e237e2b3e23e7iy2dg39ew7293e2397et23igd2g3ed2g3et23798eg23=="));
        l.add(new Option("Palma", "Hotel Don Juan", "***", "2 pax in 1 Double room", "Full board", 615.30, "EUR", "iwuedw98y23e237e2b3e23e7iy2dg39ew7293e2397et23igd2g3ed2g3et23798eg23=="));
        l.add(new Option("Palma", "Hotel Saratoga", "****", "2 pax in 1 Double room", "Bed & breakfast", 1342.10, "EUR", "iwuedw98y23e237e2b3e23e7iy2dg39ew7293e2397et23igd2g3ed2g3et23798eg23=="));
        l.add(new Option("Palma", "Hotel Saratoga", "****", "2 pax in 1 Double room", "Half board", 1630.2, "EUR", "iwuedw98y23e237e2b3e23e7iy2dg39ew7293e2397et23igd2g3ed2g3et23798eg23=="));
        l.add(new Option("Palma", "Hotel Saratoga", "****", "2 pax in 1 Suite", "Bed & breakfast", 2015.1, "EUR", "iwuedw98y23e237e2b3e23e7iy2dg39ew7293e2397et23igd2g3ed2g3et23798eg23=="));
        return l;
    }
}
