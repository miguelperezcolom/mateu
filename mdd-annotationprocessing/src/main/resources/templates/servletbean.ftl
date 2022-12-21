package com.example.demo;
import com.example.demo.MyUIServlet;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.stereotype.Service;


@Service
public class MyUIServletBean extends ServletRegistrationBean {

    public MyUIServletBean() {
        super(new MyUIServlet(), "", "/*");
        setLoadOnStartup(500);
    }

}
