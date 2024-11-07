package io.mateu.uidl.core.interfaces;

public interface Serializer {

  <T> T fromJson(String json, Class<T> c) throws Exception;

  String toJson(Object o) throws Exception;
}
