import { type ReceivableRepository } from "../../../Receivable/ReceivableRepository"
import { type CustomerAccountRepository } from "../../CustomerAccountRepository"
import { type AddInvoiceToCustomerAccount } from "./AddInvoiceToCustomerAccount"
import { Invoice } from "../../../Receivable/Invoice"

import * as fp from "fp-ts/function"
import * as Apply from "fp-ts/lib/Apply"
import * as Either from "fp-ts/lib/Either"
import * as TaskEither from "fp-ts/lib/TaskEither"

export class AddInvoiceToCustomerAccountHandler {
	constructor(
		private readonly customerAccountRepository: CustomerAccountRepository,
		private readonly invoiceRepository: ReceivableRepository<Invoice>,
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
						this.customerAccountRepository.append(
							command.customerAccountId,
							mutation.events,
						)

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
