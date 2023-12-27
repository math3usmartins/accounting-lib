import { type Receivable } from "../Receivable"
import { type Invoice } from "./Invoice"
import { type ReceivableId } from "./ReceivableId"
import { type TaskEither } from "fp-ts/lib/TaskEither"

export interface InvoiceRepository {
	getById: (id: ReceivableId) => TaskEither<Error, Receivable<Invoice>>
}
