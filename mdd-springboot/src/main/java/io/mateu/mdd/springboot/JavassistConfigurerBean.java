package io.mateu.mdd.springboot;

import io.mateu.mdd.core.MDD;
import javassist.ClassPool;
import javassist.LoaderClassPath;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
public class JavassistConfigurerBean extends ServletRegistrationBean {

    public JavassistConfigurerBean(ApplicationContext ctx) {
        super(new FakeServlet(), "/uhdhediuwhediuwheduhweduiwheduhwed");
        System.out.println("hola!!!!!");
        final ClassPool pool = ClassPool.getDefault();
        pool.appendClassPath(new LoaderClassPath(ctx.getClassLoader()));
        MDD.setClassPool(pool);
    }

}
