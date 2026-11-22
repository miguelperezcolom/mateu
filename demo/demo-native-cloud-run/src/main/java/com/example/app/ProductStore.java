package com.example.app;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.FieldPath;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.WriteBatch;
import io.mateu.uidl.interfaces.CrudStore;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

/**
 * The products, kept in Google Cloud Firestore (collection {@code products}, one document per
 * product, keyed by its id). Mateu reads and writes through this {@link CrudStore}: the screens do
 * not know where the data lives. The first time the collection is read empty, it is seeded with
 * four sample products.
 */
@ApplicationScoped
public class ProductStore implements CrudStore<Product> {

  private static final String COLLECTION = "products";

  @Inject Firestore firestore;

  private volatile boolean seeded;

  @Override
  public Optional<Product> findById(String id) {
    if (id == null || id.isBlank()) {
      return Optional.empty();
    }
    DocumentSnapshot document = await(firestore.collection(COLLECTION).document(id).get());
    return document.exists() ? Optional.of(toProduct(document)) : Optional.empty();
  }

  @Override
  public String save(Product product) {
    await(
        firestore
            .collection(COLLECTION)
            .document(product.id())
            .set(
                Map.of(
                    "name", product.name(),
                    "price", product.price(),
                    "status", product.status().name())));
    return product.id();
  }

  @Override
  public List<Product> findAll() {
    seedIfEmpty();
    return await(firestore.collection(COLLECTION).orderBy(FieldPath.documentId()).get())
        .getDocuments()
        .stream()
        .map(ProductStore::toProduct)
        .toList();
  }

  @Override
  public void deleteAllById(List<String> ids) {
    WriteBatch batch = firestore.batch();
    ids.forEach(id -> batch.delete(firestore.collection(COLLECTION).document(id)));
    await(batch.commit());
  }

  /** Back to the four sample products: every document deleted, the samples written again. */
  public synchronized void reset() {
    WriteBatch batch = firestore.batch();
    await(firestore.collection(COLLECTION).get()).getDocuments()
        .forEach(document -> batch.delete(document.getReference()));
    await(batch.commit());
    seeded = false;
    seedIfEmpty();
  }

  private void seedIfEmpty() {
    if (seeded) {
      return;
    }
    synchronized (this) {
      if (!seeded && await(firestore.collection(COLLECTION).limit(1).get()).isEmpty()) {
        save(new Product("P-001", "Espresso machine", 249.0, ProductStatus.Available));
        save(new Product("P-002", "Coffee grinder", 89.5, ProductStatus.Available));
        save(new Product("P-003", "Milk frother", 39.9, ProductStatus.OutOfStock));
        save(new Product("P-004", "Pour-over kettle", 59.0, ProductStatus.Discontinued));
      }
      seeded = true;
    }
  }

  private static Product toProduct(DocumentSnapshot document) {
    Double price = document.getDouble("price");
    return new Product(
        document.getId(),
        document.getString("name"),
        price == null ? 0 : price,
        ProductStatus.valueOf(document.getString("status")));
  }

  private static <T> T await(ApiFuture<T> future) {
    try {
      return future.get();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Interrupted talking to Firestore", e);
    } catch (ExecutionException e) {
      throw new IllegalStateException("Firestore failed: " + e.getCause().getMessage(), e.getCause());
    }
  }
}
