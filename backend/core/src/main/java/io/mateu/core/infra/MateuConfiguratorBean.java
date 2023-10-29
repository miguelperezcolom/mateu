package io.mateu.core.infra;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MateuConfiguratorBean implements io.mateu.mdd.springboot.BeanProvider {

  private final ApplicationContext сontext;


  public Object getBean(Class c) {
    Object o = null;
    try {
      o = сontext.getBean(c);
    } catch (Exception e) {
      // e.printStackTrace();
    }
    return o;
  }
}
