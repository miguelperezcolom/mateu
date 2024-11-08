package io.mateu.uidl.interfaces;

public interface Serializer {

  <T> T fromJson(String json, Class<T> c) throws Exception;

  String toJson(Object o) throws Exception;
}
