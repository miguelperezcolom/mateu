package io.mateu.mdd.core.servlet;

import io.mateu.mdd.core.util.Helper;
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

@WebServlet(name = "PlaygroundServlet", urlPatterns = {"/playground"})
public class PlaygroundServlet extends HttpServlet {



    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        StringWriter sw;
        PrintWriter pw = new PrintWriter(sw = new StringWriter());
        resp.setContentType("text/html");
        resp.getWriter().println(Helper.leerFichero(GraphQLServlet.class.getResourceAsStream("/graphql/playground.html")).replaceAll("myendpoint", req.getRequestURL().toString().replaceAll(req.getRequestURI(), "") + "/graphql"));
    }
}
