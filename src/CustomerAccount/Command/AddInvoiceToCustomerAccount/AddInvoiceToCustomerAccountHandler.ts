import { type EventStore } from "../../../EventStore"
import { type InvoiceRepository } from "../../../Receivable/InvoiceRepository"
import { type CustomerAccountEvent } from "../../CustomerAccountEvent"
import { type CustomerAccountRepository } from "../../CustomerAccountRepository"
import { type AddInvoiceToCustomerAccount } from "./AddInvoiceToCustomerAccount"

export class ReceivePaymentHandler {
	constructor(
		private readonly eventStore: EventStore<CustomerAccountEvent>,
		private readonly customerAccountRepository: CustomerAccountRepository,
		private readonly invoiceRepository: InvoiceRepository,
	) {}

	public async handle(command: AddInvoiceToCustomerAccount): Promise<number> {
		const [account, invoice] = await Promise.all([
			this.customerAccountRepository.getById(command.customerAccountId),
			this.invoiceRepository.getById(command.receivableId),
		])

		const result = account.allocateReceivable(invoice, command.dateTime)

		await this.eventStore.append(result.events)

		return await this.eventStore.flush()
	}
}
