package io.mateu.core.infra;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MateuConfiguratorBean implements io.mateu.mdd.springboot.BeanProvider {

  private final ApplicationContext сontext;


  public Object getBean(Class c) {
    Object o = null;
    try {
      o = сontext.getBean(c);
    } catch (NoSuchBeanDefinitionException ignored) {
    } catch (Exception e) {
      log.error("when trying to get a bean for class " + c.getName(), e);
    }
    return o;
  }
}
