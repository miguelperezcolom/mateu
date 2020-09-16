package io.mateu.mdd.core.servlet;

import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.JPAHelper;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

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
