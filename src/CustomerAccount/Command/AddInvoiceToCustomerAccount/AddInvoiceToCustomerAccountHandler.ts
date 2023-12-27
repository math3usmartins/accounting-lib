import { type EventStore } from "../../../EventStore"
import { type InvoiceRepository } from "../../../Receivable/InvoiceRepository"
import { type CustomerAccountEvent } from "../../CustomerAccountEvent"
import { type CustomerAccountRepository } from "../../CustomerAccountRepository"
import { type AddInvoiceToCustomerAccount } from "./AddInvoiceToCustomerAccount"

import * as fp from "fp-ts/function"
import * as Apply from "fp-ts/lib/Apply"
import * as Either from "fp-ts/lib/Either"
import * as TaskEither from "fp-ts/lib/TaskEither"

export class AddInvoiceToCustomerAccountHandler {
	constructor(
		private readonly eventStore: EventStore<CustomerAccountEvent>,
		private readonly customerAccountRepository: CustomerAccountRepository,
		private readonly invoiceRepository: InvoiceRepository,
	) {}

	public handle = (command: AddInvoiceToCustomerAccount) =>
		fp.pipe(
			this.getCustomerAndInvoice(command),
			TaskEither.map(({ customerAccount, invoice }) =>
				customerAccount.allocateReceivable(invoice, command.dateTime),
			),
			TaskEither.flatMapEither((allocation) =>
				fp.pipe(
					allocation,
					Either.map((mutation) => {
						this.eventStore.append(mutation.events)
						this.eventStore.flush()

						return mutation.mutant
					}),
				),
			),
		)

	private getCustomerAndInvoice = (command: AddInvoiceToCustomerAccount) =>
		Apply.sequenceS(TaskEither.ApplicativePar)({
			customerAccount: this.customerAccountRepository.getById(
				command.customerAccountId,
			),
			invoice: this.invoiceRepository.getById(command.receivableId),
		})
}
