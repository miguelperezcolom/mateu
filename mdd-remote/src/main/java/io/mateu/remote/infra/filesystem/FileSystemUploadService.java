package io.mateu.remote.infra.filesystem;

import io.mateu.remote.application.UploadService;
import io.mateu.remote.domain.files.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import javax.naming.AuthenticationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

@Service
public class FileSystemUploadService implements UploadService {

    @Autowired
    StorageService storageService;

    @Override
    public ResponseEntity<Resource> serveFile(String fileId,
                                              String filename)
            throws AuthenticationException {

        Resource file = storageService.loadAsResource(fileId, filename);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + file.getFilename() + "\"").body(file);
    }

    @Override
    public String getFileUrl(String fileId) throws AuthenticationException {
        return storageService.getUrl(fileId);
    }

    @Override
    public Mono<Void> handleFileUpload(String fileId,
                                       Mono<FilePart> file)
            throws AuthenticationException, ExecutionException, InterruptedException, TimeoutException {
        return storageService.store(fileId, file);
    }

}
