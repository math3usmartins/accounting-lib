import assert from "assert"

import "mocha"
import { CustomerAccount, CustomerAccountMutation } from "./CustomerAccount"
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

describe("CustomerAccount", (): void => {
	describe("fromEvents", (): void => {
		it("must add new receivable", () => {
			const actual = CustomerAccount.fromEvents(givenCustomerAccountId, [
				new ReceivableAddedToCustomerAccount(
					givenInvoice,
					givenCustomerAccountId,
					new Timestamp(332211),
				),
			])

			assert.deepStrictEqual(
				actual.id.value,
				givenCustomerAccountId.value,
			)

			// p.s. JSON serializing includes only static properties
			// therefore removing functions, which is expected for this comparison.
			const rawActual = JSON.parse(JSON.stringify(actual))

			const expected = new CustomerAccount(
				givenCustomerAccountId,
				new CustomerAccountVersion(2),
				new ReceivableCollection(givenCustomerAccountId, [
					givenInvoice,
				]),
				new PaymentCollection([]),
			)

			const rawExpected = JSON.parse(JSON.stringify(expected))

			assert.deepStrictEqual(rawActual, rawExpected)
		})
	})

	describe("allocateReceivable", (): void => {
		interface Scenario {
			customerAccount: CustomerAccount
			receivable: Receivable<Invoice>
			dateTime: Timestamp
			expected: CustomerAccountMutation
		}

		const runScenario = (scenario: Scenario) => {
			let actual: Mutation<CustomerAccount, CustomerAccountEvent>

			actual = scenario.customerAccount.allocateReceivable(
				scenario.receivable,
				scenario.dateTime,
			)

			// p.s. JSON serializing includes only static properties
			// therefore removing functions, which is expected for this comparison.
			const rawActual = JSON.parse(JSON.stringify(actual))

			const rawExpected = JSON.parse(JSON.stringify(scenario.expected))
			assert.deepStrictEqual(rawActual, rawExpected)
		}

		it("must allocate invoice without any payments", (): void => {
			runScenario({
				customerAccount: givenCustomerAccount,
				receivable: givenInvoice,
				dateTime: new Timestamp(332211),
				expected: new Mutation<CustomerAccount, CustomerAccountEvent>(
					new CustomerAccount(
						givenCustomerAccountId,
						new CustomerAccountVersion(2),
						new ReceivableCollection<Invoice>(
							givenCustomerAccountId,
							[givenInvoice],
						),
						new PaymentCollection([]),
					),
					[
						new ReceivableAddedToCustomerAccount(
							givenInvoice,
							givenCustomerAccountId,
							new Timestamp(332211),
						),
					],
				),
			})
		})

		it("must allocate invoice with pre-existing payment", (): void => {
			runScenario({
				customerAccount: givenCustomerAccountWithPayment,
				receivable: givenInvoice,
				dateTime: new Timestamp(332211),
				expected: new Mutation<CustomerAccount, CustomerAccountEvent>(
					new CustomerAccount(
						givenCustomerAccountId,
						new CustomerAccountVersion(3),
						new ReceivableCollection<Invoice>(
							givenCustomerAccountId,
							[
								givenInvoice.allocatePayment(
									new ReceivablePayment(
										new Timestamp(332211),
										givenCustomerPayment.id,
										givenInvoice.amount,
									),
								).mutant,
							],
						),
						new PaymentCollection([givenCustomerPayment]),
					),
					[
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
				),
			})
		})

		it("must fail to allocate same invoice again", (): void => {
			try {
				runScenario({
					customerAccount: givenCustomerAccount.allocateReceivable(
						givenInvoice,
						new Timestamp(332211),
					).mutant,
					receivable: givenInvoice,
					dateTime: new Timestamp(332211),
					expected: new Mutation<
						CustomerAccount,
						CustomerAccountEvent
					>(
						new CustomerAccount(
							givenCustomerAccountId,
							new CustomerAccountVersion(2),
							new ReceivableCollection<Invoice>(
								givenCustomerAccountId,
								[givenInvoice],
							),
							new PaymentCollection([]),
						),
						[
							new ReceivableAddedToCustomerAccount(
								givenInvoice,
								givenCustomerAccountId,
								new Timestamp(332211),
							),
						],
					),
				})
			} catch (err) {
				assert.deepStrictEqual(
					err,
					ReceivableAlreadyAllocatedError.fromInvoice(givenInvoice),
				)
			}
		})
	})
})
