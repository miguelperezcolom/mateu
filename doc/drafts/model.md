For creating a mateu-mdd application you basically have 2 tasks:

1. create a model
1. create an UI

This chapter focuses on the first point.

You can create the model using JPA or POJOS.

## The model

The model is the abstraction of a real business use case. In the model we expect to find:

- entities
- constraints
- logic
- unit and e2e tests


Inside our entities we will create attributes, which will hold real or calculated values. Our constraints will set the rules for our model consistency, and the logic of our model should reflect the business rules.

### Entities

We will typically create a class for every actor involved in our business, and for everything which we need to keep record of. Typical examples of entities would be Customer, Provider, Order, Invoice, or User. Usually our entities will be persisted somehow in order to survive application restarts.

When designing our classes we will usually leverage both inheritance and interfaces. It's plenty of techniques to design our model but, to resume, the point is that choosing the right entities is something which should take its time and requires a good business knowledge.

In each of our entities (classes) we will declare some attributes. Typical attributes could be "name", "age", "issueDate" or "invoiceNumber". They could also hold references to other entities, and could hold single values or collections of values.

We should try not to hold the same information in different attributes (aka normalized model) though, sometimes, we will demormalize our model for efficiency and performance shake. A typical example of denormalization are calculated attributes, like the total of an invoice which should be equal to the sum of all of the invoice lines amounts. We could create a method to calculate the total for that invoice, or we can set a calculated attribute (hence the denormalization) where we would save the total amount of that invoice without needing to go through all of the lines of the invoice.

### Constraints

To guarantee our model consistency we will usually set some constraints on our model. Typical examples of constraints could be "the name can not be empty", "age must be a positive number", "email address should be like xxxx@yyyy.zzz", "invoice total should be equal to the sum of all of the invoices lines".

Please notice that constraints rules can be entity scoped or application (across multiple entities) scoped. While entity scope constraints are easily implemented (usually by adding some annotations to our class attributes), application scope constraints can be delegated to a kind of monitoring service which periodically checks those constraints and fire an alarm in case they are violated.

We should be aware that we could accept eventual consistency for our model. This means that we expect that, while it can happen that sometimes the model is not consistent, at some point the model will be. An example of eventual consistency could be the balance attribute of our Customer entities, which should hold the sum of all of the unpaid invoices of the customer. We could decide that, for performance shake, we will update the balance reacting to an event which is fired every time we create or update an invoice in such a way that, for some seconds or minutes, the customer balance could not be correct. Obviously while this eventual consistency could be acceptable for companies like a travel agency, it would surely be inadmissible for a bank.

Besides establishing constraints, one of the best ways to protect our model consistency is by practising a defensive coding. This means enforcing the use of immutables and constraint the creation, update and deletion of entities through builders. This way we can control our entities lifecycle and prevent model inconsistencies.  

### Logic

The logic of our model should reflect our real business rules. Typical examples of our model logic could be "each time an invoice is issued send an email to the customer with the invoice pdf attached", "the 1st day of each month issue invoices to customers for all pending orders" or "to create an invoice, look for all the pending orders of the customer and create an invoice line for each order line, and then change the state of the order to INVOICED".

The business logic can be fired by:

- an user action
- a timer according to some schedule
- in response to a business event
- in response to an application lifecycle event (whenever the application starts or stops)

Our model logic can be contained in an entity method when the logic is clearly related to that entity, or we could create a class to hold the logic when it is not clearly owned by any entity or for code organization shake.

### Tests

Tests are a must have in any model. Tests perform some logic on a dataset and check the result is as expected.

They all should be run before each deployment, so we can be sure that we are not introducing regressions on our application code. If you are practicing Test Driven Development (TDD) or Behavior Driven Development (BDD) you would use them to drive your coding, so you will be supposed to have finished your work as soon as all tests pass.


### Model structure

For big models we will usually split it vertically (in layers) and/or horizontally (in boundaries).

When splitting our logic in layers any layer can only see the layers below while it can not access the layers above. The most related to the server hardware are at the bottom while the nearest to the user interface at at the top. I think the most accepted layer structure today is the one stated by the hexagonal architecture, which adds to the traditional layer design  (with a domain layer at the bottom, an application logic layer on top of it, and an application layer on top of all) the concept of injection  dependency (the ports and adapters pattern) of infrastructure (like database access, messaging queue or servlet container) components.


When splitting our model horizontally (if the business scope is big enough) we would divide our business model in pieces, so each of them is easier to handle (remember the divide and conquer principle). So, after some analysis we would decide to create independent pieces of our model (boundaries). Typical example boundaries could be "financial", "delivery", or "customer relationship management". As they should be independent, we will usually create a common boundary that will be shared among all of them for the common parts of our model (like the public domain events which would allow for inter boundary communication).

## Definition of our model using java

Now that we have a clear idea of what our model is, it is time to materialize it. As we are java developers the most natural way for defining our model is by writing java code.

We can create UML diagrams to generate our java classes as much as we can easily create UML diagrams from our classes, but the point is that it is more straightforward to directly define our model writing java code.


Once we have a clear picture of our entities, the first thing that we will do is write one java class for each of our model entities and annotate it as entity.

> Ok. If you are practising TDD you will first write your tests, but at the moment we will leave test for later.

One typical entity could be as follows:

```java

@MateuMDDEntity
public class Person {

    String name;

    LocalDate birthDate;

}

```

> The `@MateuMDDEntity` annotation allows us to remove some bolierplate code (getters, setters, adds a default id attribute and adds the JPA @Entity annotation). For a full description see [Lombok extension](Lombok-extension)

### Inheritance

Now we will see an inheritance use case. Let's say we decide that we have a Teacher entity which extends our Person entity, so our Teacher entity inherits all of the attributes (and methods) of the Person entity ("name" and "birhDate"). In java code it would be something like this:

```java

@MateuMDDEntity
public class Teacher extends Person {

    int experience;

}

```

### Calculated fields

Now we wil see how a calculated field could look like. For demostration shake we will add an age property to our Person entity, so it should return how old is the person from it's birth date.

The normalized version (no repeated information) would be like this:

```java

@MateuMDDEntity
public class Person {

    String name;

    LocalDate birthDate;

    // calculated field
    public int getAge() {
        return (int) birthDate, LocalDate.now());
    }

}

```

While the denormalized version would be like this:

```java

@MateuMDDEntity
public class Person {

    String name;

    LocalDate birthDate;

    // calculated (and persistent) field
    int age;


    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
        // age is calculated and updated each time we update the birth date value
        age = (int) birthDate, LocalDate.now());
    }

}

```

Or this:

```java

@MateuMDDEntity
public class Person {

    String name;

    LocalDate birthDate;

    // calculated (and persistent) field
    int age;


    @PrePersist@PreUpdate
    public void pre() {
        // age is calculated at the moment of saving the entity
        age = (int) birthDate, LocalDate.now());
    }

}

```

### Constraints

The simplest way to introduce entity scoped constraints in our java classes is by annotating our class fields with javax.validation [(JSR 380)}](https://www.baeldung.com/javax-validation) annotations. As an example, let's say that our "name" field can not be empty:

```java

@MateuMDDEntity
public class Person {

    @NotEmpty
    String name;

}

```

We can find quite a lot of validation annotations, like @NotNull, @AssertTrue, @Min, @Max, @Email and many more. We can even create our own custom validation annotations, like below:

```java

@MateuMDDEntity
public class Person {

    @IdDocNumber
    String idDocumentNumber;

}

```

Where we would have declared the @IdNumber annotation like this:

```java

@Constraint(validatedBy = OurIdDocNumberValidator.class)
@Target({ FIELD, METHOD, CONSTRUCTOR })
@Retention(RUNTIME)
@Documented
public @interface IdDocNumber {
 
    String message() default
      "ID document number must be valid";
 
    Class<?>[] groups() default {};
 
    Class<? extends Payload>[] payload() default {};
}

```


Where our custom validator would be something like this:

```java

public class OurIdDocNumberValidator 
    implements ConstraintValidator<IdDocNumber, String> {
 
    @Override
    public boolean isValid(
      String value, 
      ConstraintValidatorContext context) {
 
        // do our validations       
 
        return isValid;
    }
}

```

There is a lot more about JSR-380. For a full comprehension of JSR-380 just google or start by visiting:

- [https://www.baeldung.com/javax-validation](https://www.baeldung.com/javax-validation)
- [https://www.baeldung.com/javax-validation-method-constraints](https://www.baeldung.com/javax-validation-method-constraints)
- [https://www.baeldung.com/javax-validation-groups](https://www.baeldung.com/javax-validation-groups)

Another way of introducing model constraints is by overriding the setters of our class, like in the example below:

```java

@MateuMDDEntity
public class Person {

    String idDocumentNumber;

    public void setIdDocumentNumber(String value) throws Exception {
        if (!validIdDocNumber(value)) throw new Exception();
        this.idDocumentNumber = value;
    }   

}

```

Another way to apply our model constraints is by using @PrePersist and @PreUpdate annotated methods, and put our validations there. Here you have an example:

```java

@MateuMDDEntity
public class Person {
    
    // some fields...
    
    @PrePersist@PreUpdate
    public void validate() throws Exception {
        // do some validations and throw an exception if invalid
    }   

}

```

@PrePersist, @PreUpdate and @PreRemove annotated methods will be run at commit time, so we can validate that we are not sending invalid data to the database. In case the validation fails, a rollback will be run for the whole transaction. Please be aware that you could also use JPA's entity listeners if you want to put this logic out of the entity, for cleaner code shake.

For application scoped constraints you should put your validation logic somewhere and run it periodically. If something goes wrong then you could send an email, record a log entry, or whatever. Somewhere below we will see how to schedule tasks so they are automatically run at any pace. 

Now we will focus on protecting our model consistency by embracing immutables. In practise this means making our classes immutable and create builders to control our entities lifecycle, so our entities can only be created, updated or deleted through our builders. Among other things, we could use builders to force that bidirectional references are updated at both sides. Let's see all this with an example:

```java

@MateuMDDEntity
public class Person {

    @NotEmpty
    private String name;

    @OneToMany(mappedBy = "owner")
    private Set<Pet> pets;

}

@MateuMDDEntity
public class Pet {

    @NotEmpty
    private String name;

    @ManyToOne
    private Person owner;

}


```

### Logic



// ejemplo evento: en la parte de lógica


proteger nuestro modelo!

### Persistence with JPA

ojo: mientras que los casos más simples son sencillos de entender y de implementar, el dominio de la persistencia necesita una dedicación mínima y no es trivial ni inmediato

anotaciones validación, o comandos programados

### Persistence with DDD

como lo hacemos para aprovechar las ventajas de JPA a la vez que beneficiarnos de las ventajas de DDD (protección, deasacoplamiento, estandarización).

### Events

entitylisteners

### Commands

### Tests

Unit tests y e2e tests

