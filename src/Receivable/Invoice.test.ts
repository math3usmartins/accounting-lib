import assert from "assert"
import "mocha"
import { ReceivableId } from "./ReceivableId"
import { ReceivablePaymentCollection } from "./Payment/ReceivablePaymentCollection"
import { Timestamp } from "../Timestamp"
import { Money } from "../Money"
import { Currency } from "../Currency"
import { Invoice } from "./Invoice"
import { CustomerAccountId } from "../CustomerAccount/CustomerAccountId"
import { ReceivablePayment } from "./Payment/ReceivablePayment"
import { PaymentId } from "../Payment/PaymentId"

describe("Invoice", (): void => {
	const givenInvoiceId = new ReceivableId("receivable-1")
	const emptyPaymentCollection = new ReceivablePaymentCollection(
		givenInvoiceId,
		[],
	)
	const givenInvoice = new Invoice(
		new Timestamp(123456),
		givenInvoiceId,
		new CustomerAccountId("customer-1"),
		new Money(Currency.EUR, 10000),
		emptyPaymentCollection,
		false,
	)

	const invoiceStateScenarios: InvoiceStateScenario[] = [
		{
			name: "no payments",
			invoice: givenInvoice,
			expectedIsPaid: false,
			expectedIsWrittenOff: false,
			expectedPendingAmount: givenInvoice.amount,
		},
		{
			name: "fully paid through single payment",
			invoice: givenInvoice.allocatePayment(
				new ReceivablePayment(
					givenInvoice.dateTime,
					new PaymentId("payment-1"),
					givenInvoice.amount,
				),
			).mutant,
			expectedIsPaid: true,
			expectedIsWrittenOff: false,
			expectedPendingAmount: givenInvoice.amount.zero(),
		},
		{
			name: "fully paid through multiple payments",
			invoice: givenInvoice
				.allocatePayment(
					new ReceivablePayment(
						givenInvoice.dateTime,
						new PaymentId("payment-1"),
						new Money(Currency.EUR, 9000),
					),
				)
				.mutant.allocatePayment(
					new ReceivablePayment(
						givenInvoice.dateTime,
						new PaymentId("payment-2"),
						new Money(Currency.EUR, 1000),
					),
				).mutant,
			expectedIsPaid: true,
			expectedIsWrittenOff: false,
			expectedPendingAmount: givenInvoice.amount.zero(),
		},
		{
			name: "partially paid through single payment",
			invoice: givenInvoice.allocatePayment(
				new ReceivablePayment(
					givenInvoice.dateTime,
					new PaymentId("payment-1"),
					new Money(Currency.EUR, 100),
				),
			).mutant,
			expectedIsPaid: false,
			expectedIsWrittenOff: false,
			expectedPendingAmount: new Money(Currency.EUR, 9900),
		},
		{
			name: "partially paid through multiple payments",
			invoice: givenInvoice
				.allocatePayment(
					new ReceivablePayment(
						givenInvoice.dateTime,
						new PaymentId("payment-1"),
						new Money(Currency.EUR, 100),
					),
				)
				.mutant.allocatePayment(
					new ReceivablePayment(
						givenInvoice.dateTime,
						new PaymentId("payment-2"),
						new Money(Currency.EUR, 100),
					),
				).mutant,
			expectedIsPaid: false,
			expectedIsWrittenOff: false,
			expectedPendingAmount: new Money(Currency.EUR, 9800),
		},
	]

	invoiceStateScenarios.forEach((scenario: InvoiceStateScenario) => {
		it(`state: ${scenario.name}`, () => {
			assert.equal(scenario.invoice.isPaid(), scenario.expectedIsPaid)
			assert.equal(
				scenario.invoice.isWrittenOff(),
				scenario.expectedIsWrittenOff,
			)
			assert.equal(
				scenario.invoice.pendingAmount().cents,
				scenario.expectedPendingAmount.cents,
			)
			assert.equal(
				scenario.invoice.pendingAmount().currency,
				scenario.expectedPendingAmount.currency,
			)
		})
	})
})

interface InvoiceStateScenario {
	name: string
	invoice: Invoice
	expectedIsPaid: boolean
	expectedIsWrittenOff: boolean
	expectedPendingAmount: Money
}
