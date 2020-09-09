package io.mateu.showcase.tester.model.useCases.hotel;

import io.mateu.mdd.core.data.FareValue;
import lombok.MateuMDDEntity;

@MateuMDDEntity
public class DiscountOffer extends AbstractOffer {

    private FareValue value;

}
