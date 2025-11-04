package io.mateu.core.application.runaction.helpers;

import com.example.components.AnnotatedComponent;
import com.example.components.SampleApp;
import com.example.components.SampleCrud;
import com.example.components.SampleDetail;
import io.mateu.core.domain.act.ActionRunner;
import io.mateu.core.domain.out.UiIncrementMapper;
import io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper;
import io.mateu.core.domain.out.fragmentmapper.ComponentFragmentMapper;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import io.mateu.core.infra.reflection.mappers.ReflectionUiIncrementMapper;
import io.mateu.core.infra.reflection.write.RunMethodActionRunner;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import java.util.Collection;
import java.util.List;
import java.util.regex.Pattern;

public class Mocks {

  public static BeanProvider createBeans() {
    return new BeanProvider() {
      @Override
      public <T> T getBean(Class<T> clazz) {
        return null;
      }

      @Override
      public <T> Collection<T> getBeans(Class<T> clazz) {
        if (RouteResolver.class.equals(clazz)) {
          return (Collection<T>)
              List.of(
                  new RouteResolver() {

                    @Override
                    public Class<?> resolveRoute(String route, HttpRequest httpRequest) {
                      return AnnotatedComponent.class;
                    }

                    @Override
                    public List<Pattern> supportedRoutesPatterns() {
                      return List.of(Pattern.compile("xx"));
                    }
                  },
                  new RouteResolver() {

                    @Override
                    public Class<?> resolveRoute(String route, HttpRequest httpRequest) {
                      return SampleApp.class;
                    }

                    @Override
                    public List<Pattern> supportedRoutesPatterns() {
                      return List.of(Pattern.compile("/app"));
                    }
                  },
                  new RouteResolver() {

                    @Override
                    public Class<?> resolveRoute(String route, HttpRequest httpRequest) {
                      return SampleCrud.class;
                    }

                    @Override
                    public List<Pattern> supportedRoutesPatterns() {
                      return List.of(Pattern.compile("/app/crud"));
                    }
                  },
                  new RouteResolver() {

                    @Override
                    public Class<?> resolveRoute(String route, HttpRequest httpRequest) {
                      return SampleDetail.class;
                    }

                    @Override
                    public List<Pattern> supportedRoutesPatterns() {
                      return List.of(Pattern.compile("/app/crud/.*"));
                    }
                  });
        }
        if (ActionRunner.class.equals(clazz)) {
          return (Collection<T>) List.of(new RunMethodActionRunner());
        }
        if (UiIncrementMapper.class.equals(clazz)) {
          return (Collection<T>)
              List.of(
                  new ReflectionUiIncrementMapper(
                      new ComponentFragmentMapper(), new ReflectionObjectToComponentMapper()));
        }
        return (Collection<T>) List.of(new ReflectionInstanceFactory(new FakeBeanProvider()));
      }
    };
  }
}
