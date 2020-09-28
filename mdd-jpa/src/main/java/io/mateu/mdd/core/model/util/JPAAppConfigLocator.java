package io.mateu.mdd.core.model.util;

import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.shared.AppConfigLocator;
import io.mateu.mdd.shared.IAppConfig;
import io.mateu.util.persistence.JPAHelper;

public class JPAAppConfigLocator implements AppConfigLocator {
    @Override
    public IAppConfig get() throws Throwable {
        IAppConfig[] c = new IAppConfig[1];
        JPAHelper.notransact(em -> {
            c[0] = AppConfig.get(em);
        });
        return c[0];
    }

    @Override
    public Class getAppConfigClass() {
        return AppConfig.class;
    }


}
