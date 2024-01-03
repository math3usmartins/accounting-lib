import { type Receivable } from "../Receivable"
import { type ReceivableId } from "./ReceivableId"
import { type TaskEither } from "fp-ts/lib/TaskEither"

export interface ReceivableRepository<T> {
	getById: (id: ReceivableId) => TaskEither<Error, Receivable<T>>
}
