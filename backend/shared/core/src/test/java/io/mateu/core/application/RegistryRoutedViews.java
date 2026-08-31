package io.mateu.core.application;

/** Views referenced by {@code specs/ui/routes.yaml} in {@link RoutedClassResolverRegistryTest}. */
public final class RegistryRoutedViews {

  private RegistryRoutedViews() {}

  /** One view model answering two routes, told apart by the parameter each entry pins. */
  public static class Tickets {
    public String status;
  }
}
