import { InvoiceRepository } from "../InvoiceRepository"
import { ReceivableId } from "../ReceivableId"
import { Receivable } from "../../Receivable"
import { Invoice } from "../Invoice"

export class InMemoryInvoiceRepository implements InvoiceRepository {
	constructor(private items: Invoice[]) {}

	public getById = (id: ReceivableId): Promise<Receivable<Invoice>> => {
		const invoice = this.items.find((invoice) => invoice.id.isEqualTo(id))

		return invoice === undefined
			? Promise.reject(`Invoice  ${id.value} not found`)
			: Promise.resolve(invoice)
	}
}
