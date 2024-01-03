import { type ReceivableRepository } from "../ReceivableRepository"
import { type ReceivableId } from "../ReceivableId"
import { type Receivable } from "../../Receivable"
import { type EventStore } from "../../EventStore"
import { type ReceivableEvent } from "../Event/ReceivableEvent"
import { fromEvents } from "../ReceivableFactory"

import { TaskEither as TTaskEither } from "fp-ts/lib/TaskEither"
import * as TaskEither from "fp-ts/lib/TaskEither"
import * as Either from "fp-ts/lib/Either"
import * as Option from "fp-ts/lib/Option"
import * as fp from "fp-ts/function"
import { ReceivableCreated } from "../Event/ReceivableCreated"

export class EventStoreReceivableRepository<T>
	implements ReceivableRepository<T>
{
	constructor(private readonly eventStore: EventStore<ReceivableEvent>) {}

	public getById = <T>(id: ReceivableId): TTaskEither<Error, Receivable<T>> =>
		fp.pipe(
			this.streamName(id),
			this.eventStore.read,
			TaskEither.flatMapOption(
				(events) =>
					fp.pipe(
						events[0] as ReceivableCreated<T>,
						Option.fromNullable,
						Option.map((creation) =>
							fromEvents<T>(
								creation.receivable,
								events.length > 1 ? events.slice(1) : [],
							),
						),
					),
				() => new Error("Receivable not found"),
			),
			TaskEither.flatMapEither((v) => v),
		)

	private streamName = (receivableId: ReceivableId) =>
		`receivable/${receivableId.value}`
}
