import { CustomerAccountRepository } from "../CustomerAccountRepository"
import { CustomerAccount } from "../../CustomerAccount"
import { CustomerAccountId } from "../CustomerAccountId"
import { CustomerAccountNotFoundError } from "./Error/CustomerAccountNotFoundError"
import { CustomerAccountEvent } from "../CustomerAccountEvent"
import { fromEvents } from "../CustomerAccountFactory"
import { EventStore } from "../../EventStore"

import { TaskEither as TTaskEither } from "fp-ts/lib/TaskEither"
import * as TaskEither from "fp-ts/lib/TaskEither"
import * as fp from "fp-ts/function"

export class EventStoreCustomerAccountRepository
	implements CustomerAccountRepository
{
	constructor(
		private readonly eventStore: EventStore<CustomerAccountEvent>,
	) {}

	public getById = (
		accountId: CustomerAccountId,
	): TTaskEither<Error, CustomerAccount> =>
		fp.pipe(
			this.streamName(accountId),
			(streamName) => this.eventStore.read(streamName),
			TaskEither.flatMap((events) =>
				fp.pipe(
					events,
					TaskEither.fromPredicate(
						(e) => e.length > 0,
						() => CustomerAccountNotFoundError.fromId(accountId),
					),
				),
			),
			TaskEither.flatMapEither((events) => fromEvents(accountId, events)),
		)

	public append = (
		accountId: CustomerAccountId,
		events: CustomerAccountEvent[],
	): TTaskEither<Error, number> =>
		fp.pipe(this.streamName(accountId), (streamName) =>
			this.eventStore.append(streamName, events),
		)

	private streamName = (accountId: CustomerAccountId) =>
		`customeraccount/${accountId.value}`
}
