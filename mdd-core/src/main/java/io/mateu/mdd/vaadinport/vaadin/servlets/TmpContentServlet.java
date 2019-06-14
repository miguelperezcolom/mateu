package io.mateu.mdd.vaadinport.vaadin.servlets;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;

@WebServlet(value = {"/tmp/*", "/app/tmp/*"}, loadOnStartup = 10)
public class TmpContentServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response) throws ServletException, IOException {
        // reads input file from an absolute path
        String path = System.getProperty("tmpdir", request.getServletContext().getRealPath("/tmp/"));
        if (!path.endsWith("/")) path += "/";
        File downloadFile = new File(path + request.getPathInfo());
        FileInputStream inStream = new FileInputStream(downloadFile);

        // if you want to use a relative path to context root:
        String relativePath = getServletContext().getRealPath("");
        System.out.println("relativePath = " + relativePath);

        // obtains ServletContext
        ServletContext context = getServletContext();

        // gets MIME type of the file
        String mimeType = context.getMimeType(downloadFile.getAbsolutePath());
        if (mimeType == null) {
            // set to binary type if MIME mapping not found
            mimeType = "application/octet-stream";
        }
        System.out.println("MIME type: " + mimeType);

        if ("text/html".equalsIgnoreCase(mimeType)) response.setCharacterEncoding("utf-8");

        // modifies response
        response.setContentType(mimeType);
        response.setContentLength((int) downloadFile.length());

        // forces download
        /*
        String headerKey = "Content-Disposition";
        String headerValue = String.format("attachment; filename=\"%s\"", downloadFile.getName());
        response.setHeader(headerKey, headerValue);
        */

        // obtains response's output stream
        OutputStream outStream = response.getOutputStream();

        byte[] buffer = new byte[4096];
        int bytesRead = -1;

        while ((bytesRead = inStream.read(buffer)) != -1) {
            outStream.write(buffer, 0, bytesRead);
        }

        inStream.close();
        outStream.close();
    }

}