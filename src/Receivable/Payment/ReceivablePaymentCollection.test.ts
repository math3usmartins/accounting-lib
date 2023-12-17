import assert from "assert"
import "mocha"
import { ReceivablePaymentCollection } from "./ReceivablePaymentCollection"
import { ReceivablePayment } from "./ReceivablePayment"
import { PaymentId } from "../../Payment/PaymentId"
import { ReceivableId } from "../ReceivableId"
import { Money } from "../../Money"
import { Timestamp } from "../../Timestamp"
import { Currency } from "../../Currency"

describe("ReceivablePaymentCollection", (): void => {
	const receivableId = new ReceivableId("receivable-1")
	const emptyCollection = new ReceivablePaymentCollection(receivableId, [])

	const scenarios: ScenarioToTestTotal[] = [
		{
			name: "empty collection",
			collection: emptyCollection,
			expected: 0,
		},
		{
			name: "single item",
			collection: emptyCollection.with(
				new ReceivablePayment(
					new Timestamp(123456),
					new PaymentId("payment-1"),
					new Money(Currency.EUR, 111),
				),
			),
			expected: 111,
		},
		{
			name: "multiple items",
			collection: emptyCollection
				.with(
					new ReceivablePayment(
						new Timestamp(123456),
						new PaymentId("payment-1"),
						new Money(Currency.EUR, 111),
					),
				)
				.with(
					new ReceivablePayment(
						new Timestamp(123457),
						new PaymentId("payment-2"),
						new Money(Currency.EUR, 222),
					),
				),
			expected: 333,
		},
	]

	scenarios.forEach((scenario: ScenarioToTestTotal) => {
		it(`total: ${scenario.name}`, () => {
			const actual = scenario.collection.total()

			assert.equal(actual, scenario.expected)
		})
	})
})

interface ScenarioToTestTotal {
	name: string
	collection: ReceivablePaymentCollection
	expected: number
}
