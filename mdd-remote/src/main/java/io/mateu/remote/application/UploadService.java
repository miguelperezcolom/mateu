package io.mateu.remote.application;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Mono;

import javax.naming.AuthenticationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

public interface UploadService {

    ResponseEntity<Resource> serveFile(String fileId,
                                              String filename)
            throws AuthenticationException;

    String getFileUrl(String fileId) throws AuthenticationException;

    Mono<Void> handleFileUpload(String fileId,
                                       Mono<FilePart> file)
            throws AuthenticationException, ExecutionException, InterruptedException, TimeoutException;


}
