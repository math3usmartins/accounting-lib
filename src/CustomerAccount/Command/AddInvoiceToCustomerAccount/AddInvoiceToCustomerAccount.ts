import { type CustomerAccountId } from "../../CustomerAccountId"
import { type ReceivableId } from "../../../Receivable/ReceivableId"
import { type Timestamp } from "../../../Timestamp"

export class AddInvoiceToCustomerAccount {
	constructor(
		public readonly customerAccountId: CustomerAccountId,
		public readonly receivableId: ReceivableId,
		public readonly dateTime: Timestamp,
	) {}
}
