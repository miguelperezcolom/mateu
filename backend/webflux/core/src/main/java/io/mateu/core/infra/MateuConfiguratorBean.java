package io.mateu.core.infra;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressFBWarnings("ST_WRITE_TO_STATIC_FROM_INSTANCE_METHOD")
public class MateuConfiguratorBean {

  private final ApplicationContext сontext;

  private static MateuConfiguratorBean _instance;

  @PostConstruct
  public void init() {
    _instance = this;
  }

  public static MateuConfiguratorBean get() {
    return _instance;
  }

  public <T> T getBean(Class<T> c) {
    T bean = null;
    try {
      bean = сontext.getBean(c);
    } catch (NoSuchBeanDefinitionException ignored) {
    } catch (Exception e) {
      log.error("when trying to get a bean for class " + c.getName(), e);
    }
    return bean;
  }
}
