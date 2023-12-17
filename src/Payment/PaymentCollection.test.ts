import assert from "assert"
import "mocha"
import { Payment } from "../Payment"
import { PaymentCollection } from "./PaymentCollection"
import { Money } from "../Money"
import { Currency } from "../Currency"
import { PaymentId } from "./PaymentId"
import { Timestamp } from "../Timestamp"
import { PaymentAlreadyFoundError } from "./Error/PaymentAlreadyFoundError"

describe("PaymentCollection", (): void => {
	interface ScenarioToTestContains {
		name: string
		collection: PaymentCollection
		payment: Payment
		expected: boolean
	}

	const givenPayment = new Payment(
		new PaymentId("1"),
		new Timestamp(11),
		new Money(Currency.EUR, 111),
	)

	const anotherPayment = new Payment(
		new PaymentId("2"),
		new Timestamp(22),
		new Money(Currency.EUR, 222),
	)

	const scenariosToTestContains: ScenarioToTestContains[] = [
		{
			name: "empty collection",
			collection: new PaymentCollection([]),
			payment: givenPayment,
			expected: false,
		},
		{
			name: "payment not found",
			collection: new PaymentCollection([givenPayment]),
			payment: anotherPayment,
			expected: false,
		},
		{
			name: "payment found in first position",
			collection: new PaymentCollection([givenPayment, anotherPayment]),
			payment: givenPayment,
			expected: true,
		},
		{
			name: "payment found in last position",
			collection: new PaymentCollection([givenPayment, anotherPayment]),
			payment: anotherPayment,
			expected: true,
		},
	]

	scenariosToTestContains.forEach((scenario: ScenarioToTestContains) => {
		it(`contains: ${scenario.name}`, (): void => {
			const actual = scenario.collection.contains(scenario.payment)
			assert.equal(actual, scenario.expected)
		})
	})

	interface ScenarioToTestAppending {
		name: string
		collection: PaymentCollection
		payment: Payment
		expected: PaymentCollection | Error
	}

	const scenariosToTestAppending: ScenarioToTestAppending[] = [
		{
			name: "empty collection",
			collection: new PaymentCollection([]),
			payment: givenPayment,
			expected: new PaymentCollection([givenPayment]),
		},
		{
			name: "non empty collection",
			collection: new PaymentCollection([givenPayment]),
			payment: anotherPayment,
			expected: new PaymentCollection([givenPayment, anotherPayment]),
		},
		{
			name: "payment already found",
			collection: new PaymentCollection([givenPayment]),
			payment: givenPayment,
			expected: new PaymentAlreadyFoundError(givenPayment.id),
		},
	]

	scenariosToTestAppending.forEach((scenario: ScenarioToTestAppending) => {
		it(`append payment: ${scenario.name}`, (): void => {
			if (scenario.expected instanceof Error) {
				let err = false

				try {
					scenario.collection.with(scenario.payment)
					assert.equal(false, true, "expected an error here")
				} catch (e) {
					assert.deepEqual(e, scenario.expected)
					err = true
				}

				assert.equal(err, true)
			}

			if (scenario.expected instanceof PaymentCollection) {
				const actual = scenario.collection.with(scenario.payment)

				assert.deepEqual(actual.items(), scenario.expected.items())
			}
		})
	})

	interface ScenarioToTestTotal {
		name: string
		collection: PaymentCollection
		expected: number
	}

	const scenariosToTestTotal: ScenarioToTestTotal[] = [
		{
			name: "empty collection",
			collection: new PaymentCollection([]),
			expected: 0,
		},
		{
			name: "single payment",
			collection: new PaymentCollection([givenPayment]),
			expected: givenPayment.amount.cents,
		},
		{
			name: "multiple payments",
			collection: new PaymentCollection([givenPayment, anotherPayment]),
			expected: givenPayment.amount.cents + anotherPayment.amount.cents,
		},
	]

	scenariosToTestTotal.forEach((scenario: ScenarioToTestTotal) => {
		it(`total: ${scenario.name}`, (): void => {
			const actual = scenario.collection.total()

			assert.equal(actual, scenario.expected)
		})
	})
})
