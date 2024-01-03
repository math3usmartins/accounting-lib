import { type Receivable } from "../../Receivable"
import { type Timestamp } from "../../Timestamp"
import { type ReceivableId } from "../ReceivableId"
import { type ReceivableEvent } from "./ReceivableEvent"

export class ReceivableCreated<T> implements ReceivableEvent {
	public readonly receivableId: ReceivableId

	constructor(
		public readonly dateTime: Timestamp,
		public readonly receivable: Receivable<T>,
	) {
		this.receivableId = receivable.id
	}
}
