package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.core.data.Data;
import io.mateu.mdd.core.data.SupplementOrPositive;

public interface ISupplementOrPositive {

    void fromData(SupplementOrPositive data);


    SupplementOrPositive toData();
}
