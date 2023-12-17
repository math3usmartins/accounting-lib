import { Receivable } from "../../Receivable"
import { Invoice } from "../../Receivable/Invoice"

export class ReceivableAlreadyAllocatedError extends Error {
	public static fromInvoice = (
		receivable: Receivable<Invoice>,
	): ReceivableAlreadyAllocatedError =>
		new ReceivableAlreadyAllocatedError(
			`Receivable ID ${receivable.id.value} was already allocated`,
		)
}
