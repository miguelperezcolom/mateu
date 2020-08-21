package io.mateu.mdd.core.util;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.shared.INotifier;

public class Notifier implements INotifier {
    @Override
    public void alert(Throwable throwable) {
        MDD.alert(throwable);
    }
}
