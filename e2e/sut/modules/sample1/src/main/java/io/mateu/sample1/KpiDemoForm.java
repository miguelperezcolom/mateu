package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/kpi")
@Title("KPI Demo Form")
@Getter
@Setter
public class KpiDemoForm {

    @KPI
    String totalUsers = "1,234";

    @KPI
    String activeOrders = "56";

    @KPI
    String revenue = "$12,500";

    String searchQuery;

    @Button
    public Message refresh() {
        return new Message("Refreshed!");
    }

}
