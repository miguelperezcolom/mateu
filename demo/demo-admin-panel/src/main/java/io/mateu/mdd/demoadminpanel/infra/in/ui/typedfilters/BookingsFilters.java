package io.mateu.mdd.demoadminpanel.infra.in.ui.typedfilters;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.DateRange;
import io.mateu.uidl.data.NumberRange;
import java.util.Set;
import lombok.Data;

@Data
public class BookingsFilters {

    @Label("Created")
    DateRange created;

    @Label("Total")
    NumberRange total;

    @Label("Channel")
    Set<Channel> channels;
}
