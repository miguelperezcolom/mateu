package io.mateu.remote.domain.files;

import org.springframework.stereotype.Service;

@Service
public class StorageServiceAccessor {

  private static StorageServiceAccessor _instance;

  private final StorageService _storageService;

  public StorageServiceAccessor(StorageService storageService) {
    _storageService = storageService;
    _instance = this;
  }

  public static StorageService get() {
    return _instance._storageService;
  }
}
