package io.mateu.mdd.core.servlet;

import org.glassfish.jersey.server.ResourceConfig;
import org.glassfish.jersey.server.ServerConfig;
import org.glassfish.jersey.server.model.Resource;
import org.glassfish.jersey.servlet.ServletContainer;

import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.Path;
import javax.ws.rs.core.Application;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Map;
import java.util.Set;

@WebServlet(name = "AllServletsListingServlet", urlPatterns = {"/allservlets/*"})
public class AllServletsListingServlet extends HttpServlet {



    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        StringWriter sw;
        PrintWriter pw = new PrintWriter(sw = new StringWriter());


        pw.println("<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <title>Title</title>\n" +
                "</head>\n" +
                "<body>\n" +
                "\n");

        pw.println("<ul>");

        Map<String, ? extends ServletRegistration> servletRegistrations = req.getServletContext().getServletRegistrations();

        req.getServletContext().getServlets().asIterator().forEachRemaining(s -> {
            try {
                resp.getWriter().println(" ]]> " + s.getServletConfig().getServletName());
            } catch (IOException e) {
                e.printStackTrace();
            }
        });

        for (Map.Entry<String, ? extends ServletRegistration> entry : servletRegistrations.entrySet()) {
            String p = entry.getKey();
            ServletRegistration r = entry.getValue();
            System.out.println(r.getClassName());

            for (String mapping : r.getMappings()) {
                resp.getWriter().println("<li>" + mapping + "</li>");
            }


            try {
                Class c = Class.forName(r.getClassName());

                if (ServletContainer.class.equals(c)) {
                    ServletContainer sc = (ServletContainer) req.getServletContext().getServlet(r.getMappings().iterator().next());
                    ResourceConfig rc = null;
                    if (sc != null) {
                        rc = sc.getConfiguration();
                    } else {
                        try {
                            rc = (ResourceConfig) Class.forName(p).newInstance();
                        } catch (InstantiationException e) {
                            e.printStackTrace();
                        } catch (IllegalAccessException e) {
                            e.printStackTrace();
                        }
                    }
                    if (rc != null) {
                        /*
                        resp.getWriter().println(" ---> " + rc.getApplication());
                        resp.getWriter().println(" ---> " + req.getServletPath());
                        resp.getWriter().println(" ---> " + req.getContextPath());
                        resp.getWriter().println(" ---> " + req.getRequestURI());
                        resp.getWriter().println(" ---> " + req.getRequestURL());
                        resp.getWriter().println(" ---> " + req.getRequestURL().toString().replaceAll(req.getRequestURI(), ""));
                        */
                        if (rc.getClass().isAnnotationPresent(ApplicationPath.class)) {
                            resp.getWriter().println("<li><a href='https://editor.swagger.io/?url=" + req.getRequestURL().toString().replaceAll(req.getRequestURI(), "") + "/" + ((ApplicationPath)rc.getClass().getAnnotation(ApplicationPath.class)).value() + "/swagger.json'>" + ((ApplicationPath)rc.getClass().getAnnotation(ApplicationPath.class)).value() + "</a></li>");
                        }
                        for (Resource res : rc.getResources()) {
                            //resp.getWriter().println(" -----> " + res.getPath());
                            ///swagger-ui/?url=http://localhost:8080/rest/swagger.json
                            //http://petstore.swagger.io/?url=http://localhost:8080/rest/swagger.json
                            //https://editor.swagger.io/?url=http://localhost:8080/rest/swagger.json        genera cliente y servidor
                        }
                        for (Class res : rc.getApplication().getClasses()) {
                            //resp.getWriter().println(" -----> " + res.getName());
                            if (res.isAnnotationPresent(Path.class)) {
                                //resp.getWriter().println(" -------> " + ((Path)res.getAnnotation(Path.class)).value());
                            }
                        }
                    } else {
                        //resp.getWriter().println(" ---> rc es null!!!");
                    }
                }

                if (Application.class.isAssignableFrom(c)) {
                    ResourceConfig instance = ResourceConfig.forApplicationClass(c);
                    ServerConfig scfg = instance.getConfiguration();
                    Set<Class<?>> classes = scfg.getClasses();
                    classes.forEach(x -> {
                        try {
                            if (false) resp.getWriter().println(" : " + x.getName());
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    });

                }
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }


        }

        pw.println("</ul>");

        pw.println("\n" +
                "</body>\n" +
                "</html>");

        resp.setContentType("text/html");
        resp.getWriter().println(sw.toString());
    }
}
