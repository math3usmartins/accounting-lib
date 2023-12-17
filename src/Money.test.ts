import assert from "assert"
import "mocha"
import { Currency } from "./Currency"
import { Money } from "./Money"

describe("Money", (): void => {
	interface ScenarioToAdd {
		name: string
		a: Money
		b: Money
		expected: Money
	}

	const scenariosToAdd = [
		{
			name: "1 + 2 = 3",
			a: new Money(Currency.EUR, 1),
			b: new Money(Currency.EUR, 2),
			expected: new Money(Currency.EUR, 3),
		},
		{
			name: "4 + 6 = 10",
			a: new Money(Currency.EUR, 4),
			b: new Money(Currency.EUR, 6),
			expected: new Money(Currency.EUR, 10),
		},
	]

	scenariosToAdd.forEach((scenario: ScenarioToAdd) => {
		it(`must add two values: ${scenario.name}`, (): void => {
			const actual = scenario.a.add(scenario.b.cents)
			assert.equal(scenario.expected.cents, actual.cents)
			assert.equal(scenario.a.currency, actual.currency)
		})
	})

	interface ScenarioToSubtract {
		name: string
		a: Money
		b: Money
		expected: Money
	}

	const scenariosToSubtract: ScenarioToSubtract[] = [
		{
			name: "1 - 0 = 1",
			a: new Money(Currency.EUR, 1),
			b: new Money(Currency.EUR, 0),
			expected: new Money(Currency.EUR, 1),
		},
		{
			name: "0 - 1 = -1",
			a: new Money(Currency.EUR, 0),
			b: new Money(Currency.EUR, 1),
			expected: new Money(Currency.EUR, -1),
		},
	]

	scenariosToSubtract.forEach((scenario: ScenarioToSubtract) => {
		it(`must susbtract two values: ${scenario.name}`, (): void => {
			const actual = scenario.a.subtract(scenario.b.cents)
			assert.equal(scenario.expected.cents, actual.cents)
			assert.equal(scenario.a.currency, actual.currency)
		})
	})

	interface ScenarioToCalcDeductibleAmount {
		name: string
		a: Money
		b: Money
		expected: Money
	}

	const scenariosToCalcDeductibleAmount: ScenarioToCalcDeductibleAmount[] = [
		{
			name: "pay fully: 5/5 with 1 left",
			a: new Money(Currency.EUR, 5),
			b: new Money(Currency.EUR, 6),
			expected: new Money(Currency.EUR, 5),
		},
		{
			name: "pay partially: 5/6 with 0 left",
			a: new Money(Currency.EUR, 6),
			b: new Money(Currency.EUR, 5),
			expected: new Money(Currency.EUR, 5),
		},
		{
			name: "different currency is not deductible",
			a: new Money(Currency.EUR, 6),
			b: new Money(Currency.GBP, 5),
			expected: new Money(Currency.EUR, 0),
		},
	]

	scenariosToCalcDeductibleAmount.forEach((scenario: ScenarioToAdd) => {
		it(`must calculate deductible amount: ${scenario.name}`, (): void => {
			const actual = scenario.a.deductible(scenario.b)
			assert.equal(scenario.expected.cents, actual.cents)
			assert.equal(scenario.a.currency, actual.currency)
		})
	})
})
