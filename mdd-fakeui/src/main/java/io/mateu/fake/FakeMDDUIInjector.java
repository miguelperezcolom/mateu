package io.mateu.fake;

import com.google.auto.service.AutoService;
import io.mateu.mdd.shared.ui.IMDDUI;
import io.mateu.mdd.shared.ui.IMDDUIInjector;

@AutoService(IMDDUIInjector.class)
public class FakeMDDUIInjector implements IMDDUIInjector {


    @Override
    public IMDDUI get() {
        return new FakeUI();
    }
}
