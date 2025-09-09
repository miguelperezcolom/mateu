package com.example.demo.infra.in.upload;

import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Post;
import io.micronaut.http.multipart.StreamingFileUpload;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.io.File;
import java.io.IOException;

@Controller("/upload")
@Slf4j
public class FileUploadController {


    @Post(consumes = {MediaType.MULTIPART_FORM_DATA}, produces = {MediaType.TEXT_PLAIN})
    Mono<HttpResponse<String>> upload(StreamingFileUpload file) throws IOException {
        log.info("receiving file {}", file.getFilename());
        var tempFile = File.createTempFile(file.getFilename(), "temp");
        log.info("created temp file {}", tempFile.getAbsolutePath());
        var uploadPublisher = file.transferTo(tempFile);
        return Mono.fromDirect(uploadPublisher).map(success -> {
            log.info("result {}", success);
            if (success) {
                return HttpResponse.ok("Uploaded");
            }
            else {
                return HttpResponse.status(HttpStatus.CONFLICT).body("Upload Failed");
            }
        });
    }

}
