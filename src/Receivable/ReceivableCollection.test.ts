import assert from "assert"
import "mocha"
import { ReceivableId } from "./ReceivableId"
import { ReceivablePaymentCollection } from "./Payment/ReceivablePaymentCollection"
import { Timestamp } from "../Timestamp"
import { Money } from "../Money"
import { Currency } from "../Currency"
import { Invoice } from "./Invoice"
import { CustomerAccountId } from "../CustomerAccount/CustomerAccountId"
import { ReceivableCollection } from "./ReceivableCollection"
import { AggregateCommandOutput } from "../AggregateCommandOutput"
import { PaymentAllocatedToReceivable } from "./Event/PaymentAllocatedToReceivable"
import { Payment } from "../Payment"
import { PaymentId } from "../Payment/PaymentId"
import { ReceivablePayment } from "./Payment/ReceivablePayment"

const givenInvoiceId = new ReceivableId("receivable-1")
const givenInvoice = new Invoice(
	new Timestamp(123456),
	givenInvoiceId,
	new CustomerAccountId("customer-1"),
	new Money(Currency.EUR, 10000),
	new ReceivablePaymentCollection(givenInvoiceId, []),
	false,
)

const anotherInvoiceId = new ReceivableId("receivable-2")
const anotherInvoice = new Invoice(
	new Timestamp(123457),
	anotherInvoiceId,
	new CustomerAccountId("customer-1"),
	new Money(Currency.EUR, 10000),
	new ReceivablePaymentCollection(givenInvoiceId, []),
	false,
)

const emptyReceivableCollection = new ReceivableCollection<Invoice>(givenInvoice.customerAccountId, [])

describe("ReceivableCollection.contains()", (): void => {
	const scenarios = (): ScenarioForContainsMethod[] => [
		{
			name: "empty collection",
			collection: emptyReceivableCollection,
			receivable: givenInvoice,
			expected: false,
		},
		{
			name: "first entry found",
			collection: emptyReceivableCollection.with(givenInvoice).with(anotherInvoice),
			receivable: givenInvoice,
			expected: true,
		},
		{
			name: "last entry found",
			collection: emptyReceivableCollection.with(givenInvoice).with(anotherInvoice),
			receivable: anotherInvoice,
			expected: true,
		},
	]

	scenarios().forEach((scenario: ScenarioForContainsMethod) => {
		it(`contains: ${scenario.name}`, () => {
			assert.equal(scenario.expected, scenario.collection.contains(scenario.receivable))
		})
	})
})

describe("ReceivableCollection.with()", () => {
	it("must reject including already existing receivable", () => {
		let failed = false

		try {
			emptyReceivableCollection.with(givenInvoice).with(givenInvoice)
		} catch (e) {
			failed = true
		}

		assert.equal(failed, true)
	})
})

describe("ReceivableCollection.allocatePayment()", (): void => {
	const givenInvoiceFullPayment = new Payment(new PaymentId("1"), new Timestamp(1), givenInvoice.amount)
	const paymentAllocatedAt = new Timestamp(2)

	const givenInvoiceWithFullPayment = givenInvoice.allocatePayment(
		new ReceivablePayment(paymentAllocatedAt, givenInvoiceFullPayment.id, givenInvoiceFullPayment.amount),
	).aggregate

	const givenInvoicePartialPayment = new Payment(
		new PaymentId("1"),
		new Timestamp(1),
		givenInvoice.amount.subtract(1),
	)

	const givenInvoiceWithPartialPayment = givenInvoice.allocatePayment(
		new ReceivablePayment(paymentAllocatedAt, givenInvoicePartialPayment.id, givenInvoicePartialPayment.amount),
	).aggregate

	const overPayment = new Payment(
		new PaymentId("1"),
		new Timestamp(1),
		givenInvoice.amount.add(anotherInvoice.amount.cents).add(1),
	)
	const anotherInvoiceFullPayment = new Payment(new PaymentId("1"), new Timestamp(1), anotherInvoice.amount)

	const anotherInvoiceWithFullPayment = anotherInvoice.allocatePayment(
		new ReceivablePayment(paymentAllocatedAt, anotherInvoiceFullPayment.id, anotherInvoiceFullPayment.amount),
	).aggregate

	const scenarios: ScenarioForAllocatePayment[] = [
		{
			name: "empty collection",
			collection: emptyReceivableCollection,
			payment: new Payment(new PaymentId("1"), new Timestamp(1), new Money(Currency.EUR, 10000)),
			allocatedAt: new Timestamp(2),
			expected: new AggregateCommandOutput<ReceivableCollection<Invoice>, PaymentAllocatedToReceivable>(
				emptyReceivableCollection,
				[],
			),
			expectedAllocatedAmounts: [],
		},
		{
			name: "single item fully paid",
			collection: emptyReceivableCollection.with(givenInvoice),
			payment: givenInvoiceFullPayment,
			allocatedAt: new Timestamp(2),
			expected: new AggregateCommandOutput<ReceivableCollection<Invoice>, PaymentAllocatedToReceivable>(
				emptyReceivableCollection.with(givenInvoiceWithFullPayment),
				[
					new PaymentAllocatedToReceivable(
						paymentAllocatedAt,
						new PaymentId("1"),
						givenInvoice.id,
						givenInvoice.customerAccountId,
						givenInvoiceFullPayment.amount,
					),
				],
			),
			expectedAllocatedAmounts: [10000],
		},
		{
			name: "single item partially paid",
			collection: emptyReceivableCollection.with(givenInvoice),
			payment: givenInvoicePartialPayment,
			allocatedAt: new Timestamp(2),
			expected: new AggregateCommandOutput<ReceivableCollection<Invoice>, PaymentAllocatedToReceivable>(
				emptyReceivableCollection.with(givenInvoiceWithPartialPayment),
				[
					new PaymentAllocatedToReceivable(
						paymentAllocatedAt,
						new PaymentId("1"),
						givenInvoice.id,
						givenInvoice.customerAccountId,
						givenInvoicePartialPayment.amount,
					),
				],
			),
			expectedAllocatedAmounts: [9999],
		},
		{
			name: "overpayment",
			collection: emptyReceivableCollection.with(givenInvoice).with(anotherInvoice),
			payment: overPayment,
			allocatedAt: new Timestamp(2),
			expected: new AggregateCommandOutput<ReceivableCollection<Invoice>, PaymentAllocatedToReceivable>(
				emptyReceivableCollection.with(givenInvoiceWithFullPayment).with(anotherInvoiceWithFullPayment),
				[
					new PaymentAllocatedToReceivable(
						paymentAllocatedAt,
						new PaymentId("1"),
						givenInvoice.id,
						givenInvoice.customerAccountId,
						givenInvoice.amount,
					),
					new PaymentAllocatedToReceivable(
						paymentAllocatedAt,
						new PaymentId("1"),
						anotherInvoice.id,
						anotherInvoice.customerAccountId,
						anotherInvoice.amount,
					),
				],
			),
			expectedAllocatedAmounts: [10000, 10000],
		},
	]

	scenarios.forEach((scenario: ScenarioForAllocatePayment) => {
		it(`contains: ${scenario.name}`, () => {
			const actual = scenario.collection.allocatePayment(scenario.payment, scenario.allocatedAt)

			// p.s. JSON serializing includes only static properties
			// therefore removing functions, which is expected for this comparison.
			const rawActual = JSON.parse(JSON.stringify(actual))

			const allocatedAmounts = rawActual.events.map((event: any) => event.amount.cents)

			assert.deepStrictEqual(allocatedAmounts, scenario.expectedAllocatedAmounts)

			assert.deepStrictEqual(rawActual.aggregate, JSON.parse(JSON.stringify(scenario.expected.aggregate)))

			assert.deepStrictEqual(rawActual.events, JSON.parse(JSON.stringify(scenario.expected.events)))
		})
	})
})

interface ScenarioForContainsMethod {
	name: string
	collection: ReceivableCollection<Invoice>
	receivable: Invoice
	expected: boolean
}

interface ScenarioForAllocatePayment {
	name: string
	collection: ReceivableCollection<Invoice>
	payment: Payment
	allocatedAt: Timestamp
	expected: AggregateCommandOutput<ReceivableCollection<Invoice>, PaymentAllocatedToReceivable>
	expectedAllocatedAmounts: number[]
}
