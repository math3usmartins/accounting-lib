import assert from "assert"
import "mocha"

import * as CustomerAccountFactory from "./CustomerAccountFactory"
import { CustomerAccount } from "../CustomerAccount"
import { Timestamp } from "../Timestamp"
import { PaymentCollection } from "../Payment/PaymentCollection"
import { CustomerAccountId } from "../CustomerAccount/CustomerAccountId"
import { ReceivableCollection } from "../Receivable/ReceivableCollection"
import { Invoice } from "../Receivable/Invoice"
import { ReceivableId } from "../Receivable/ReceivableId"
import { Money } from "../Money"
import { ReceivablePaymentCollection } from "../Receivable/Payment/ReceivablePaymentCollection"
import { PaymentAllocatedToReceivable } from "../Receivable/Event/PaymentAllocatedToReceivable"
import { Currency } from "../Currency"
import { ReceivableAddedToCustomerAccount } from "../CustomerAccount/Event/ReceivableAddedToCustomerAccount"
import { PaymentId } from "../Payment/PaymentId"
import { CustomerAccountVersion } from "../CustomerAccount/CustomerAccountVersion"

import * as fp from "fp-ts/function"
import * as Either from "fp-ts/lib/Either"

const givenCustomerAccountId = new CustomerAccountId("customer-1")

const givenInvoiceId = new ReceivableId("receivable-1")
const givenInvoice = new Invoice(
	new Timestamp(123456),
	givenInvoiceId,
	new CustomerAccountId("customer-1"),
	new Money(Currency.EUR, 10000),
	new ReceivablePaymentCollection(givenInvoiceId, []),
	false,
)

describe("CustomerAccountFactory", () => {
	describe("fromEvents", (): void => {
		it("it must handle ReceivableAddedToCustomerAccount", () => {
			const pipe = fp.pipe(
				CustomerAccountFactory.fromEvents(givenCustomerAccountId, [
					new ReceivableAddedToCustomerAccount(
						givenInvoice,
						givenCustomerAccountId,
						new Timestamp(332211),
					),
				]),
				Either.match(
					(err) => {
						throw err
					},
					(actual) =>
						fp.flow(() => {
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
								new ReceivableCollection(
									givenCustomerAccountId,
									[givenInvoice],
								),
								new PaymentCollection([]),
							)

							const rawExpected = JSON.parse(
								JSON.stringify(expected),
							)

							assert.deepStrictEqual(rawActual, rawExpected)

							return true
						}),
				),
			)

			assert.equal(pipe(), true)
		})

		it("must ignore PaymentAllocatedToReceivable", () => {
			const actual = CustomerAccountFactory.fromEvents(
				givenCustomerAccountId,
				[
					new PaymentAllocatedToReceivable(
						new Timestamp(1),
						new PaymentId("2"),
						givenInvoice.id,
						givenCustomerAccountId,
						givenInvoice.amount,
					),
				],
			)

			assert.equal(Either.isRight(actual), true)
		})
	})
})
