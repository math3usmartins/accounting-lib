import assert from "assert"
import "mocha"
import { Payment } from "./Payment"
import { PaymentId } from "./Payment/PaymentId"
import { Timestamp } from "./Timestamp"
import { Currency } from "./Currency"
import { PaymentReceivableCollection } from "./Payment/Receivable/PaymentReceivableCollection"
import { Money } from "./Money"
import { PaymentReceivable } from "./Payment/Receivable/PaymentReceivable"
import { ReceivableId } from "./Receivable/ReceivableId"

describe("Payment", (): void => {
	interface AvailableAmountScenario {
		name: string
		payment: Payment
		expected: Money
	}

	const givenPayment = new Payment(
		new PaymentId("1"),
		new Timestamp(1),
		new Money(Currency.EUR, 9999),
		new PaymentReceivableCollection([]),
	)

	const availableAmountScenarios: AvailableAmountScenario[] = [
		{
			name: "fully available",
			payment: givenPayment,
			expected: givenPayment.amount,
		},
		{
			name: "fully used",
			payment: givenPayment.withReceivable(
				new PaymentReceivable(new Timestamp(1), new ReceivableId("11111"), givenPayment.amount),
			),
			expected: givenPayment.amount.zero(),
		},
		{
			name: "partially used",
			payment: givenPayment.withReceivable(
				new PaymentReceivable(new Timestamp(1), new ReceivableId("11111"), new Money(Currency.EUR, 1)),
			),
			expected: new Money(Currency.EUR, 9998),
		},
	]

	availableAmountScenarios.forEach((scenario: AvailableAmountScenario) => {
		it(`availableAmount: ${scenario.name}`, () => {
			const actual = scenario.payment.availableAmount()

			assert.equal(actual.cents, scenario.expected.cents)
			assert.equal(actual.currency, scenario.expected.currency)
		})
	})
})
