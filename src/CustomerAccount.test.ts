import assert from "assert"

import "mocha"
import { CustomerAccount } from "./CustomerAccount"
import { type Receivable } from "./Receivable"
import { Timestamp } from "./Timestamp"
import { PaymentCollection } from "./Payment/PaymentCollection"
import { CustomerAccountId } from "./CustomerAccount/CustomerAccountId"
import { ReceivableCollection } from "./Receivable/ReceivableCollection"
import { Invoice } from "./Receivable/Invoice"
import { ReceivableId } from "./Receivable/ReceivableId"
import { Money } from "./Money"
import { ReceivablePaymentCollection } from "./Receivable/Payment/ReceivablePaymentCollection"
import { PaymentAllocatedToReceivable } from "./Receivable/Event/PaymentAllocatedToReceivable"
import { type PaymentAddedToCustomerAccount } from "./CustomerAccount/Event/PaymentAddedToCustomerAccount"
import { Currency } from "./Currency"
import { ReceivableAddedToCustomerAccount } from "./CustomerAccount/Event/ReceivableAddedToCustomerAccount"
import { Payment } from "./Payment"
import { PaymentId } from "./Payment/PaymentId"
import { ReceivablePayment } from "./Receivable/Payment/ReceivablePayment"
import { CustomerAccountVersion } from "./CustomerAccount/CustomerAccountVersion"
import { ReceivableAlreadyAllocatedError } from "./CustomerAccount/Error/ReceivableAlreadyAllocatedError"
import { CustomerAccountEvent } from "./CustomerAccount/CustomerAccountEvent"
import { Mutation } from "./Mutation"

const givenCustomerAccountId = new CustomerAccountId("customer-1")
const givenCustomerAccount = new CustomerAccount(
	givenCustomerAccountId,
	new CustomerAccountVersion(1),
	new ReceivableCollection<Invoice>(givenCustomerAccountId, []),
	new PaymentCollection([]),
)

const givenCustomerPayment = new Payment(
	new PaymentId("payment-1"),
	new Timestamp(123456),
	new Money(Currency.EUR, 99999),
)

const givenCustomerAccountWithPayment = givenCustomerAccount.allocatePayment(
	givenCustomerPayment,
	new Timestamp(123456),
).mutant

const givenInvoiceId = new ReceivableId("receivable-1")
const givenInvoice = new Invoice(
	new Timestamp(123456),
	givenInvoiceId,
	new CustomerAccountId("customer-1"),
	new Money(Currency.EUR, 10000),
	new ReceivablePaymentCollection(givenInvoiceId, []),
	false,
)

describe("CustomerAccount.fromEvents()", (): void => {
	it("ReceivableAddedToCustomerAccount", () => {
		const actual = CustomerAccount.fromEvents(givenCustomerAccountId, [
			new ReceivableAddedToCustomerAccount(
				givenInvoice,
				givenCustomerAccountId,
				new Timestamp(332211),
			),
		])

		assert.deepStrictEqual(actual.id.value, givenCustomerAccountId.value)

		// p.s. JSON serializing includes only static properties
		// therefore removing functions, which is expected for this comparison.
		const rawActual = JSON.parse(JSON.stringify(actual))

		const expected = new CustomerAccount(
			givenCustomerAccountId,
			new CustomerAccountVersion(2),
			new ReceivableCollection(givenCustomerAccountId, [givenInvoice]),
			new PaymentCollection([]),
		)

		const rawExpected = JSON.parse(JSON.stringify(expected))

		assert.deepStrictEqual(rawActual, rawExpected)
	})
})

describe("CustomerAccount.allocateReceivable()", (): void => {
	const scenarios: ScenarioToAllocateReceivable[] = [
		{
			name: "allocate invoice without any payments",
			customerAccount: givenCustomerAccount,
			receivable: givenInvoice,
			dateTime: new Timestamp(332211),
			expectedError: null,
			expectedAggregate: new CustomerAccount(
				givenCustomerAccountId,
				new CustomerAccountVersion(2),
				new ReceivableCollection<Invoice>(givenCustomerAccountId, [
					givenInvoice,
				]),
				new PaymentCollection([]),
			),
			expectedEvents: [
				new ReceivableAddedToCustomerAccount(
					givenInvoice,
					givenCustomerAccountId,
					new Timestamp(332211),
				),
			],
		},
		{
			name: "allocate invoice with pre-existing payment",
			customerAccount: givenCustomerAccountWithPayment,
			receivable: givenInvoice,
			dateTime: new Timestamp(332211),
			expectedError: null,
			expectedAggregate: new CustomerAccount(
				givenCustomerAccountId,
				new CustomerAccountVersion(3),
				new ReceivableCollection<Invoice>(givenCustomerAccountId, [
					givenInvoice.allocatePayment(
						new ReceivablePayment(
							new Timestamp(332211),
							givenCustomerPayment.id,
							givenInvoice.amount,
						),
					).mutant,
				]),
				new PaymentCollection([givenCustomerPayment]),
			),
			expectedEvents: [
				new ReceivableAddedToCustomerAccount(
					givenInvoice,
					givenCustomerAccountId,
					new Timestamp(332211),
				),
				new PaymentAllocatedToReceivable(
					new Timestamp(332211),
					givenCustomerPayment.id,
					givenInvoiceId,
					givenCustomerAccountId,
					givenInvoice.amount,
				),
			],
		},
		{
			name: "fail to allocate same invoice again",
			customerAccount: givenCustomerAccount.allocateReceivable(
				givenInvoice,
				new Timestamp(332211),
			).mutant,
			receivable: givenInvoice,
			dateTime: new Timestamp(332211),
			expectedError:
				ReceivableAlreadyAllocatedError.fromInvoice(givenInvoice),
			expectedAggregate: new CustomerAccount(
				givenCustomerAccountId,
				new CustomerAccountVersion(2),
				new ReceivableCollection<Invoice>(givenCustomerAccountId, [
					givenInvoice,
				]),
				new PaymentCollection([]),
			),
			expectedEvents: [
				new ReceivableAddedToCustomerAccount(
					givenInvoice,
					givenCustomerAccountId,
					new Timestamp(332211),
				),
			],
		},
	]

	scenarios.forEach((scenario: ScenarioToAllocateReceivable) => {
		it(scenario.name, () => {
			let actual: Mutation<CustomerAccount, CustomerAccountEvent>

			try {
				actual = scenario.customerAccount.allocateReceivable(
					scenario.receivable,
					scenario.dateTime,
				)
			} catch (actualError) {
				if (scenario.expectedError) {
					assert.deepStrictEqual(actualError, scenario.expectedError)
					return
				} else {
					throw actualError
				}
			}

			// p.s. JSON serializing includes only static properties
			// therefore removing functions, which is expected for this comparison.
			const rawActual = JSON.parse(JSON.stringify(actual))

			const rawExpectedAggregate = JSON.parse(
				JSON.stringify(scenario.expectedAggregate),
			)
			assert.deepStrictEqual(rawActual.mutant, rawExpectedAggregate)

			const rawExpectedEvents = JSON.parse(
				JSON.stringify(scenario.expectedEvents),
			)
			assert.deepStrictEqual(rawActual.events, rawExpectedEvents)
		})
	})
})

interface ScenarioToAllocateReceivable {
	name: string
	customerAccount: CustomerAccount
	receivable: Receivable<Invoice>
	dateTime: Timestamp
	expectedError: Error | null
	expectedAggregate: CustomerAccount
	expectedEvents: Array<
		| PaymentAllocatedToReceivable
		| PaymentAddedToCustomerAccount
		| ReceivableAddedToCustomerAccount
	>
}
