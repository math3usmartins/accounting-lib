import { type Receivable } from "../../Receivable"
import { type CustomerAccountId } from "../CustomerAccountId"
import { type Timestamp } from "../../Timestamp"
import { type Invoice } from "../../Receivable/Invoice"

export class ReceivableAddedToCustomerAccount {
	constructor(
		public readonly receivable: Receivable<Invoice>,
		public readonly customerAccountId: CustomerAccountId,
		public readonly dateTime: Timestamp,
	) {}
}
