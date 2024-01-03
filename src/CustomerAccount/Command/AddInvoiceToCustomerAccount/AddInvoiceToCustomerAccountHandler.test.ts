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
import { EventStoreCustomerAccountRepository } from "../../Repository/EventStoreCustomerAccountRepository"
import { EventStoreReceivableRepository } from "../../../Receivable/Repository/EventStoreReceivableRepository"
import { CustomerAccount } from "../../../CustomerAccount"
import { ReceivableAlreadyAllocatedError } from "../../Error/ReceivableAlreadyAllocatedError"
import { CustomerAccountVersion } from "../../CustomerAccountVersion"
import { ReceivableCollection } from "../../../Receivable/ReceivableCollection"
import { PaymentCollection } from "../../../Payment/PaymentCollection"
import { CustomerAccountNotFoundError } from "../../Repository/Error/CustomerAccountNotFoundError"
import { CustomerAccountCreated } from "../../Event/CustomerAccountCreated"
import { ReceivableAddedToCustomerAccount } from "../../Event/ReceivableAddedToCustomerAccount"
import { type ReceivableEvent } from "../../../Receivable/Event/ReceivableEvent"

import * as fp from "fp-ts/function"
import * as Either from "fp-ts/lib/Either"
import * as TaskEither from "fp-ts/lib/TaskEither"
import { InMemoryEventStore } from "../../../EventStore/InMemoryEventStore"
import { CustomerAccountEvent } from "../../CustomerAccountEvent"
import { ReceivableCreated } from "../../../Receivable/Event/ReceivableCreated"

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
		it("must add invoice and return customer account", async () => {
			const eventStore = new InMemoryEventStore<
				CustomerAccountEvent | ReceivableEvent
			>([
				{
					name: `customeraccount/${customerAccountId.value}`,
					events: [
						new CustomerAccountCreated(
							customerAccountId,
							new Timestamp(123456),
						),
					],
				},
				{
					name: `receivable/${givenInvoice.id.value}`,
					events: [
						new ReceivableCreated<Invoice>(
							givenInvoice.dateTime,
							givenInvoice,
						),
					],
				},
			])

			const repository = new EventStoreCustomerAccountRepository(
				eventStore as InMemoryEventStore<CustomerAccountEvent>,
			)

			const handler = new AddInvoiceToCustomerAccountHandler(
				repository,
				new EventStoreReceivableRepository(
					eventStore as InMemoryEventStore<ReceivableEvent>,
				),
			)

			const command = new AddInvoiceToCustomerAccount(
				givenInvoice.customerAccountId,
				givenInvoice.id,
				new Timestamp(123457),
			)

			const result = await handler.handle(command)()
			const streamName = `customeraccount/${customerAccountId.value}`
			const events = await eventStore.read(streamName)()

			if (Either.isLeft(result)) {
				throw result.left
			}

			assert.deepStrictEqual(
				JSON.parse(JSON.stringify(result.right)),
				JSON.parse(
					JSON.stringify(
						new CustomerAccount(
							customerAccountId,
							new CustomerAccountVersion(2),
							new ReceivableCollection(customerAccountId, [
								givenInvoice,
							]),
							new PaymentCollection([]),
						),
					),
				),
			)

			await fp.pipe(
				repository.getById(givenInvoice.customerAccountId),
				TaskEither.match(
					(err) => {
						throw err
					},
					(accountFromRepo) => {
						assert.deepStrictEqual(
							accountFromRepo.receivables.contains(givenInvoice),
							true,
						)
					},
				),
			)()
		})
	})

	context("failure when invoice is duplicated", () => {
		it("must return error", async () => {
			const customerAccountWithInvoice = CustomerAccount.initial(
				customerAccountId,
			).allocateReceivable(givenInvoice, new Timestamp(123457))

			if (Either.isLeft(customerAccountWithInvoice)) {
				throw customerAccountWithInvoice.left
			}

			const eventStore = new InMemoryEventStore<
				CustomerAccountEvent | ReceivableEvent
			>([
				{
					name: `customeraccount/${customerAccountId.value}`,
					events: [
						new CustomerAccountCreated(
							customerAccountId,
							new Timestamp(123456),
						),
						new ReceivableAddedToCustomerAccount(
							givenInvoice,
							customerAccountId,
							new Timestamp(123456),
						),
					],
				},
				{
					name: `receivable/${givenInvoice.id.value}`,
					events: [
						new ReceivableCreated<Invoice>(
							givenInvoice.dateTime,
							givenInvoice,
						),
					],
				},
			])

			const repository = new EventStoreCustomerAccountRepository(
				eventStore as InMemoryEventStore<CustomerAccountEvent>,
			)

			const handler = new AddInvoiceToCustomerAccountHandler(
				repository,
				new EventStoreReceivableRepository(
					eventStore as InMemoryEventStore<ReceivableEvent>,
				),
			)

			const command = new AddInvoiceToCustomerAccount(
				givenInvoice.customerAccountId,
				givenInvoice.id,
				new Timestamp(123457),
			)

			const result = await handler.handle(command)()

			if (Either.isRight(result)) {
				throw new Error("Expected ReceivableAlreadyAllocatedError")
			}

			assert.deepStrictEqual(
				result.left,
				ReceivableAlreadyAllocatedError.fromInvoice(givenInvoice),
			)
		})
	})

	context("customer not found", () => {
		it("must return error", async () => {
			const eventStore = new InMemoryEventStore<
				CustomerAccountEvent | ReceivableEvent
			>([])

			const handler = new AddInvoiceToCustomerAccountHandler(
				new EventStoreCustomerAccountRepository(
					eventStore as InMemoryEventStore<CustomerAccountEvent>,
				),
				new EventStoreReceivableRepository(
					eventStore as InMemoryEventStore<ReceivableEvent>,
				),
			)

			const command = new AddInvoiceToCustomerAccount(
				givenInvoice.customerAccountId,
				givenInvoice.id,
				new Timestamp(123457),
			)

			const result = await handler.handle(command)()

			if (Either.isRight(result)) {
				throw new Error("Expected CustomerAccountNotFoundError")
			}

			assert.deepStrictEqual(
				result.left,
				CustomerAccountNotFoundError.fromId(
					givenInvoice.customerAccountId,
				),
			)
		})
	})
})
