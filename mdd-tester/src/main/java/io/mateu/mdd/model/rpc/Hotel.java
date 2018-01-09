package io.mateu.mdd.model.rpc;

import io.mateu.ui.mdd.server.annotations.Ignored;
import io.mateu.ui.mdd.server.annotations.ListColumn;
import io.mateu.ui.mdd.server.annotations.SearchFilter;
import io.mateu.ui.mdd.server.annotations.Tab;
import lombok.Getter;
import lombok.Setter;
import org.eclipse.persistence.config.QueryHints;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @NotNull
    @SearchFilter
    private String name;

    @Ignored
    @OneToMany(mappedBy = "hotel")
    private List<StopSalesLine> stopSalesLines = new ArrayList<>();
}
