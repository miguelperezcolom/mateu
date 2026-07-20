package io.mateu;

import io.micronaut.context.annotation.Import;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.SerdeImport;

/**
 * Ships mateu's bean definitions, bean introspections and serde serializers inside the
 * micronaut-core jar, so applications only need to add the dependency. The bean definitions are
 * generated at this module's compile time by the micronaut annotation processors, exactly as if the
 * application had declared this same {@code @Import} itself.
 *
 * <p>The import is filtered by annotation (instead of {@code annotated = "*"}) so package-private
 * helper types and value objects never become beans — which also makes scanning anonymous/inner
 * classes harmless.
 */
@Introspected(packages = "io.mateu.dtos")
@SerdeImport(packageName = "io.mateu.dtos")
@Import(
    packages = {
      "io.mateu.core.application",
      "io.mateu.core.application.runaction",
      "io.mateu.core.domain.act",
      "io.mateu.core.domain.in",
      "io.mateu.core.domain.out",
      "io.mateu.core.domain.out.componentmapper",
      "io.mateu.core.domain.out.fragmentmapper",
      "io.mateu.core.infra",
      // io.mateu.core.infra.adapters is deliberately not scanned: AdapterInstanceFactory would
      // become a second InstanceFactory bean next to ReflectionInstanceFactory, breaking the
      // single-bean injection the micronaut integration relies on
      "io.mateu.core.infra.out",
      "io.mateu.core.infra.reflection",
      "io.mateu.core.infra.reflection.write",
      "io.mateu.core.infra.valuegenerators"
    },
    annotated = {"jakarta.inject.Singleton", "jakarta.inject.Named"})
public class MateuMicronautConfig {}
