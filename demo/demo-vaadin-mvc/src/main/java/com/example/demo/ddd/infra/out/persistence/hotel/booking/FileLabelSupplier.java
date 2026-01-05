package com.example.demo.ddd.infra.out.persistence.hotel.booking;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FileLabelSupplier implements LabelSupplier {

    final FileRepository fileRepository;

    @Override
    public String label(Object id, HttpRequest httpRequest) {
        return fileRepository.findById((String) id)
                .map(File::name)
                .orElse("No file with id " + id);
    }
}
