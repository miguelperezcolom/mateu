package io.mateu.uidl.interfaces;

public interface ConsumesHash {

  Object consume(String hash, HttpRequest httpRequest);
}
