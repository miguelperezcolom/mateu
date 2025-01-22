package io.mateu.uidl.interfaces;

public interface JpaRpcCrudFactory {

  Listing create(JpaCrud crud) throws Exception;
}
