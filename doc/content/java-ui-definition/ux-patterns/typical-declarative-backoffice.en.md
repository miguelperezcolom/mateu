---
title: "Typical declarative backoffice"
weight: 120
---

Ok. So, let's say we want to build a backoffice for our entities. 

**Mateu**'s main purpose is to allow you to do it
by writing the minimum lines of code, in a declarative way. Here we are gonna see how we can do it.

## Our use case

For clarity shake we are gonna build a backoffice for
a simplified travel booking system with the following entities:

- agency
- country
- destination
- room type code
- board type code
- hotel
- inventory
- stop sales
- contract
- tariff
- booking

We are gonna follow a hexagonal architecture approach.

In the domain layer, for each entity, we are defining the entity itself and a repository interface in the ports package 
in the application layer. We are gonna implement the repository interface in the infrastructure layer.

We are gonna define our backoffice in the ui package in the infrastructure layer.

## The domain

This is a sample entity and repository definitions:

```java
public record Agency(
        @NotEmpty
        @EditableOnlyWhenCreating 
        String id,
        @NotEmpty
        String name
) implements GenericEntity {
}

public interface AgencyRepository 
  extends Repository<Agency, String> {
}

```

## The infrastructure

Here we provide the adapters for the ports, and we also define the controllers for the synchronous apis, the 
event consumers and producers for the async apis and the UIs. In essence, we define what connects our domain to 
the outside world.

## Persistence

Here we provide the adapters for the repositories. For simplicity's sake we are gonna implement the repository interfaces 
like this:

```java
@Service
public class LocalAgencyRepository 
  extends LocalRepository<Agency, String> 
  implements AgencyRepository {
}
```

Where **LocalRepository** is a generic repository storing the entities in memory using a simple **Map**, like this:

```java
public class LocalRepository<EntityType 
  extends Entity<IdType>, IdType> 
  implements Repository<EntityType, IdType> {

    private final Map<IdType, EntityType> repository = new ConcurrentHashMap<>();

    @Override
    public void saveAll(List<EntityType> entities) {
        entities.forEach(entity -> repository.put(entity.id(), entity));
    }

    @Override
    public List<EntityType> findAll() {
        return repository.values().stream().toList();
    }

    @Override
    public Optional<EntityType> findById(IdType id) {
        return Optional.ofNullable(repository.get(id));
    }
}
```

### The UI

The first thing is to define the UI. This means, an app with some menus for accessing the different cruds:

```java
@MateuUI("")
@Style("width: 100%;")
public class Home {

    @Menu
    Agencies agencies;

    @Menu
    MasterDataMenu masterData;

    @Menu
    ProductSubmenu product;

    String content = "Welcome to our awesome booking system";

}

public class MasterDataMenu {

  @Menu
  Countries countries;
  @Menu
  Destinations destinations;
  @Menu
  Seasons seasons;
  @Menu
  RoomTypeCodes roomTypeCodes;
  @Menu
  BoardTypeCodes boardTypeCodes;
  
}

public class ProductSubmenu {

  @Menu
  Hotels hotels;
  @Menu
  Inventories inventories;
  @Menu
  Contracts contracts;
  @Menu
  Tariffs tariffs;

}

```
#### The CRUDs

Each of those edge menu option is a class extending the **GenericCrud** class, for an entity. Something like this:

```java
@Service
@RequiredArgsConstructor
public class Agencies extends GenericCrud<Agency> {

    final AgencyRepository agencyRepository;

    @Override
    public Repository<Agency, String> repository() {
        return agencyRepository;
    }
}
```

The **GenericCrud** class provides the list, create, view, edit and delete functionalities out of the box, inferring the
columns and fields from the entity fields.

#### Foreign keys

There are some fields that are indeed foreign keys to other entities. For those fields we want to provide a way to choose
the referenced entity rather than providing the raw value. We can easily do it by providing a class implementing the 
**ForeignKeyOptionsSupplier** interface and annotating the foreign key field with **@ForeignKey** like below:

```java

@Service
@RequiredArgsConstructor
public class CountryCodeOptionsSupplier 
  implements ForeignKeyOptionsSupplier {

  final CountryRepository countryRepository;

  @Override
  public ListingData<Option> search(
    String searchText, Pageable pageable, HttpRequest httpRequest) {
    var found = countryRepository.findAll();
    return new ListingData<>(new Page<>(
      searchText,
      found.size(),
      0,
      found.size(),
      found.stream().map(country -> 
        new Option(country.code(), country.name())).toList()));
  }
}

public record Destination(
  @NotEmpty
  @EditableOnlyWhenCreating
  String code,
  @NotEmpty
  String name,
  @ForeignKey(CountryCodeOptionsSupplier.class)
  @NotNull
  String countryCode,
  @NotEmpty
  @ForeignKey(HotelIdOptionsSupplier.class)
  List<String> hotelIds
) implements GenericEntity {

  // the GenericCrud class expects entities to have an id field
  @Override
  public String id() {
    return code;
  }

}

```

