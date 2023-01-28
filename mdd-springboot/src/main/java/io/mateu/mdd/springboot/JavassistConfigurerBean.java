package io.mateu.mdd.springboot;

import io.mateu.mdd.core.MDD;
import javassist.ClassPool;
import javassist.LoaderClassPath;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class JavassistConfigurerBean extends ServletRegistrationBean {

    public JavassistConfigurerBean(ApplicationContext ctx) {
        super(new FakeServlet(), "/uhdhediuwhediuwheduhweduiwheduhwed"); // an improbable path, never to be reached
        log.info("setting class pool for javassist");
        final ClassPool pool = ClassPool.getDefault();
        pool.appendClassPath(new LoaderClassPath(ctx.getClassLoader()));
        MDD.setClassPool(pool);
    }

}
