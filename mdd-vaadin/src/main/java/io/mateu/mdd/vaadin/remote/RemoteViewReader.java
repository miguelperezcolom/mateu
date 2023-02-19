package io.mateu.mdd.vaadin.remote;

import io.mateu.mdd.shared.interfaces.RemoteForm;
import io.mateu.remote.dtos.View;
import io.mateu.util.Helper;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class RemoteViewReader {
    public View read(RemoteForm remoteForm) throws URISyntaxException, IOException, InterruptedException {

        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(remoteForm.getBaseUrl() + (remoteForm.getBaseUrl().endsWith("/")?"":"/") + "mateu/v1/views/" + remoteForm.getClassName()))
                .GET()
                .build();

        HttpResponse<String> response = HttpClient.newBuilder().build()
                .send(request, HttpResponse.BodyHandlers.ofString());

        View view = Helper.fromJson(response.body(), View.class);
        return view;
    }
}
