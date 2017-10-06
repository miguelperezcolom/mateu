package io.mateu.mdd.model.finnancials;

import javax.persistence.Embeddable;
import javax.persistence.ManyToOne;
import java.time.LocalDateTime;

/**
 * Created by miguel on 1/10/16.
 */
@Embeddable
public class Amount {

    private long value;

    private int decimals;

    private long nucs;

    @ManyToOne
    private Currency currency;

    private double changeRate;

    private LocalDateTime date;

}
