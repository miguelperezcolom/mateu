package io.mateu.mdd.tester.model.useCases.hotel;

import io.mateu.mdd.core.data.FareValue;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;

@Entity
@Getter@Setter
public class EarlyBookingOffer extends AbstractOffer {

    private double discount;

}
