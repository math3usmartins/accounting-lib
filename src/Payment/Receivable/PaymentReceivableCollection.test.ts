import assert from "assert"
import "mocha"
import { PaymentReceivableCollection } from "./PaymentReceivableCollection"
import { PaymentReceivable } from "./PaymentReceivable"
import { Timestamp } from "../../Timestamp"
import { ReceivableId } from "../../Receivable/ReceivableId"
import { Money } from "../../Money"
import { Currency } from "../../Currency"

describe("PaymentReceivableCollection", (): void => {
	interface Scenario {
		name: string
		collection: PaymentReceivableCollection
		expected: number
	}

	const scenarios: Scenario[] = [
		{
			name: "empty collection",
			collection: new PaymentReceivableCollection([]),
			expected: 0,
		},
		{
			name: "single item",
			collection: new PaymentReceivableCollection([
				new PaymentReceivable(new Timestamp(123456), new ReceivableId("1"), new Money(Currency.EUR, 11)),
			]),
			expected: 11,
		},
		{
			name: "multiple items",
			collection: new PaymentReceivableCollection([
				new PaymentReceivable(new Timestamp(123456), new ReceivableId("1"), new Money(Currency.EUR, 11)),
				new PaymentReceivable(new Timestamp(654321), new ReceivableId("2"), new Money(Currency.EUR, 22)),
			]),
			expected: 33,
		},
	]

	scenarios.forEach((scenario: Scenario) => {
		it(`total: ${scenario.name}`, () => {
			const actual = scenario.collection.total()

			assert.equal(actual, scenario.expected)
		})
	})
})
