package com.example.demo.ddd.infra.out.persistence.hotel.financial;

import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyLabelSupplier;
import io.mateu.core.infra.declarative.Entity;
import io.mateu.core.infra.declarative.GenericEntity;
import io.mateu.core.infra.valuegenerators.LocatorValueGenerator;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.data.Amount;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record Account(
        @GeneratedValue(LocatorValueGenerator.class)
        String id,
        @NotEmpty
        @ForeignKey(search = AgencyIdOptionsSupplier.class, label = AgencyLabelSupplier.class)
        String agencyId,
        String name,
        Amount balance,
        String comments
)  implements GenericEntity {
}
