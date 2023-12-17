import { type Receivable } from "../Receivable"
import { type Invoice } from "./Invoice"
import { type ReceivableId } from "./ReceivableId"

export interface InvoiceRepository {
	getById: (id: ReceivableId) => Promise<Receivable<Invoice>>
}
