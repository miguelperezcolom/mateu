package io.mateu.mdd.demovb.infra.in.ui.mastertabs;

import io.mateu.uidl.interfaces.FeatureFlags;
import io.mateu.uidl.interfaces.HttpRequest;
import org.springframework.stereotype.Component;

/** The flags of this demo: `audit` and `simulator` are off; any other flag is unknown (= on). */
@Component
public class DemoFeatureFlags implements FeatureFlags {

  @Override
  public Boolean isEnabled(String flag, HttpRequest httpRequest) {
    return "audit".equals(flag) || "simulator".equals(flag) ? Boolean.FALSE : null;
  }
}
