import { InvoiceRepository } from "../InvoiceRepository"
import { ReceivableId } from "../ReceivableId"
import { Receivable } from "../../Receivable"
import { Invoice } from "../Invoice"
import { TaskEither as TTaskEither } from "fp-ts/lib/TaskEither"
import * as TaskEither from "fp-ts/lib/TaskEither"
import * as Option from "fp-ts/lib/Option"
import * as fp from "fp-ts/function"

export class InMemoryInvoiceRepository implements InvoiceRepository {
	constructor(private items: Invoice[]) {}

	public getById = (
		id: ReceivableId,
	): TTaskEither<Error, Receivable<Invoice>> =>
		fp.pipe(
			this.items.find((invoice) => invoice.id.isEqualTo(id)),
			Option.fromNullable,
			Option.match(
				() =>
					TaskEither.left(
						new Error(`Invoice  ${id.value} not found`),
					),
				(invoice) => TaskEither.right(invoice),
			),
		)
}
