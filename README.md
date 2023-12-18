# Accounting with domain driven design, functional programming & event sourcing

A sample accounting project with best practices in software design for simple
& safe code respecting accounting standards.

## Inspiration

> the process of being mentally stimulated to do or feel something, especially
> to do something creative.

This project is certainly inspired by many years of experience working with
awesome colleagues and complex systems, making it clear that functional
programming can be very useful for software in all business areas.

It's also inspired by a few books that you definitely should read.

### Books

1. [Grokking Simplicity: Taming complex software with functional thinking][1]
   by Eric Normand (ISBN 9781617296208)
2. [Grokking Functional Programming][2] by Michał Płachta (ISBN 9781617291838)
3. [Domain-Driven Design: Tackling Complexity in the Heart of Software, 1st edition][3]
   by Eric Evans (ISBN 9780321125217)
4. [Implementing Domain-Driven Design][4] by Vaughn Vernon (ISBN 9780321834577)

Thank you all `\o/` -- colleagues, companies and authors.

## Event sourcing: compliance

Accounting is a clear use case for [event sourcing][5], where data **MUST NOT** be
simply updated. Instead of that, every change **MUST** be appended to a journal,
where all transactions are logged individually. After that, they can be
aggregated to support different needs. e.g. specific journals or financial
reports.

## Domain driven design: events and aggregates

This project was designed according to practices defined by
[domain-driven design][6] -- making use of events, aggregates, entities and
strongly typed values as value objects, avoiding anemic classes.

Of course, as this project is simply an example, with clear domain and bounded
context, there's no need for strategic design, so it's basically applying
tactical design with events and aggregates.

## Functional programming: safety

This project also follows the [functional programming][7] paradigm, with mostly
pure functions and mostly immutable values, avoiding unexpected side effects as
much as possible. Of course at some point some mutation needs to be done, some
state needs to be changed, but such mutations are deferred as much as possible.

### Mutation, mutant and events

Functions that would normally mutate a value, have been designed to actually
return a specific type `Mutation<MutantType, EventType>` containing
`mutant: MutantType` and `events: EventType[]` that caused the mutation.

That avoids impure functions & provides any events that need to be stored in the
event store for event sourcing.

In other words, a new value with different state is returned without changing
the state of the original value, but including the events that caused the
new state.

**Example**

```typescript
const mutation: Mutation<CustomerAccount, CustomerAccountEvent> =
	customerAccount.allocatePayment(payment, currentDateTime)

const updatedCustomerAccount: CustomerAccount = mutation.mutant
const events: CustomerAccountEvent[] = mutation.events
```

## Typescript: even more easy & safe... and more popular

A statically typed programming language makes the software more safe to run
and more easy to understand and work with. Avoiding run-time errors is a great
benefit, as well as knowing what types to expect as arguments and return values.

TypeScript is a very popular language, therefore more people and companies get
a chance to understand and experiment event sourcing, domain-driven design and
functional programming paradigm.

Unfortunately that's not the case for [Haskell][8] or other purely functional
programming languages.

[1]: https://www.manning.com/books/grokking-simplicity
[2]: https://www.manning.com/books/grokking-functional-programming
[3]: https://www.pearson.com/en-us/subject-catalog/p/domain-driven-design-tackling-complexity-in-the-heart-of-software/P200000009375/9780321125217
[4]: https://www.pearson.com/en-us/subject-catalog/p/implementing-domain-driven-design/P200000009616/9780133039887
[5]: https://martinfowler.com/eaaDev/EventSourcing.html
[6]: https://en.wikipedia.org/wiki/Domain-driven_design
[7]: https://en.wikipedia.org/wiki/Functional_programming
[8]: https://en.wikipedia.org/wiki/Haskell
