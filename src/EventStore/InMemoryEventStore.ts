import * as fp from "fp-ts/function"
import * as TaskEither from "fp-ts/lib/TaskEither"
import * as Option from "fp-ts/lib/Option"
import { type TaskEither as TTaskEither } from "fp-ts/lib/TaskEither"
import { type EventStore } from "../EventStore"

interface InMemoryStream<T> {
	name: string
	events: T[]
}

export class InMemoryEventStore<T> implements EventStore<T> {
	constructor(private streams: Array<InMemoryStream<T>>) {}

	public read = (stream: string): TTaskEither<Error, T[]> =>
		fp.pipe(
			this.streams.find((s) => s.name === stream),
			Option.fromNullable,
			Option.alt(() =>
				Option.some({
					name: stream,
					events: [] as T[],
				}),
			),
			Option.map((s) => s.events),
			TaskEither.fromOption(
				() => new Error(`Failed to read events from ${stream} stream`),
			),
		)

	public append = (stream: string, events: T[]): TTaskEither<Error, number> =>
		fp.pipe(
			Option.Do,
			Option.bind("existingKey", () =>
				Option.fromNullable(
					this.streams.findIndex((s) => s.name === stream),
				),
			),
			Option.bind("existingStream", () =>
				Option.fromNullable(
					this.streams.find((s) => s.name === stream),
				),
			),
			Option.map(({ existingKey: k, existingStream: s }) => {
				this.streams[k] = {
					name: stream,
					events: [...s.events, ...events],
				}

				return this.streams[k]
			}),
			Option.alt(() => {
				const newStream = {
					name: stream,
					events: [...events],
				}

				this.streams.push(newStream)

				return Option.some(newStream)
			}),
			TaskEither.fromOption(
				() => new Error(`Failed to store events into ${stream} stream`),
			),
			TaskEither.map((s) => s.events.length),
		)
}
