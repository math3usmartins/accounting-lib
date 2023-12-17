# Accounting with event sourcing

Accounting is a clear use case for event sourcing, where data **MUST NOT** be
simply updated. Instead of that, every change **MUST** be appended to a journal,
where all transactions are logged individually. After that, they can be
aggregated to support different needs. e.g. specific journals or financial
reports.

## Domain driven design: ubiquitous language, aggregates and more

This project was designed according to practices defined by the
[domain-driven design][1]

## Functional programming: easy and safe

This project also follows the [functional programming][2] paradigm, where
functions are pure and objects are immutable, avoiding unexpected side effects.

## Typescript: even more easy and even more safe, and even more popular

A statically typed programming language makes the software more safe and more
easy to understand. Using TypeScript makes it also popular for many developers
in the world, so more people get a chance to understand and play with event
sourcing.

Unfortunately that's not the case for [Haskell][3] or other purely functional
programming languages.

[1]: https://en.wikipedia.org/wiki/Domain-driven_design

[2]: https://en.wikipedia.org/wiki/Functional_programming

[3]: https://en.wikipedia.org/wiki/Haskell
