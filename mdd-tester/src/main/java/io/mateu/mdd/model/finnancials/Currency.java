package io.mateu.mdd.model.finnancials;

import io.mateu.ui.mdd.server.annotations.QLForCombo;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;

/**
 * holder for currencies
 *
 * Created by miguel on 13/9/16.
 */
@Entity
@Getter@Setter
@QLForCombo(ql = "select x.isoCode, x.name from Currency x order by x.name")
public class Currency {

    @Id
    @NotNull
    private String isoCode;

    private String iso4217Code;

    @NotNull
    private String name;

    private int decimals;
}
