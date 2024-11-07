package io.mateu.uidl.core.interfaces;

public interface JpaRpcCrudFactory {

  Listing create(JpaCrud crud) throws Exception;
}
