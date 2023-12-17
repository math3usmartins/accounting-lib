import assert from "assert"
import "mocha"
import { ReceivableId } from "../../../Receivable/ReceivableId"
import { Invoice } from "../../../Receivable/Invoice"
import { Timestamp } from "../../../Timestamp"
import { CustomerAccountId } from "../../CustomerAccountId"
import { Money } from "../../../Money"
import { Currency } from "../../../Currency"
import { ReceivablePaymentCollection } from "../../../Receivable/Payment/ReceivablePaymentCollection"
import { AddInvoiceToCustomerAccount } from "./AddInvoiceToCustomerAccount"
import { AddInvoiceToCustomerAccountHandler } from "./AddInvoiceToCustomerAccountHandler"
import { InMemoryEventStore } from "../../../EventStore/InMemoryEventStore"
import { InMemoryCustomerAccountRepository } from "../../Repository/InMemoryCustomerAccountRepository"
import { InMemoryInvoiceRepository } from "../../../Receivable/Repository/InMemoryInvoiceRepository"
import { CustomerAccountEvent } from "../../CustomerAccountEvent"
import { CustomerAccount } from "../../../CustomerAccount"
import { ReceivableAlreadyAllocatedError } from "../../Error/ReceivableAlreadyAllocatedError"

describe("AddInvoiceToCustomerAccountHandler", () => {
	const customerAccountId = new CustomerAccountId("customer-1")
	const givenInvoiceId = new ReceivableId("receivable-1")
	const givenInvoice = new Invoice(
		new Timestamp(123456),
		givenInvoiceId,
		customerAccountId,
		new Money(Currency.EUR, 10000),
		new ReceivablePaymentCollection(givenInvoiceId, []),
		false,
	)

	context("success when invoice is unique", () => {
		it("must add invoice and return events", async () => {
			const handler = new AddInvoiceToCustomerAccountHandler(
				new InMemoryEventStore<CustomerAccountEvent>([]),
				new InMemoryCustomerAccountRepository([
					CustomerAccount.initial(customerAccountId),
				]),
				new InMemoryInvoiceRepository([givenInvoice]),
			)

			const command = new AddInvoiceToCustomerAccount(
				givenInvoice.customerAccountId,
				givenInvoice.id,
				new Timestamp(123457),
			)

			const result = await handler.handle(command)

			assert.equal(result, 1)
		})
	})

	context("failure when invoice is duplicated", () => {
		it("must add invoice and return events", async () => {
			const handler = new AddInvoiceToCustomerAccountHandler(
				new InMemoryEventStore<CustomerAccountEvent>([]),
				new InMemoryCustomerAccountRepository([
					CustomerAccount.initial(
						customerAccountId,
					).allocateReceivable(givenInvoice, new Timestamp(123457))
						.aggregate,
				]),
				new InMemoryInvoiceRepository([givenInvoice]),
			)

			const command = new AddInvoiceToCustomerAccount(
				givenInvoice.customerAccountId,
				givenInvoice.id,
				new Timestamp(123457),
			)

			let failed = false

			try {
				await handler.handle(command)
			} catch (err) {
				failed = true
				assert.deepStrictEqual(
					err,
					ReceivableAlreadyAllocatedError.fromInvoice(givenInvoice),
				)
			}

			assert.equal(failed, true)
		})
	})
})
