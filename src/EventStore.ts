import { TaskEither } from "fp-ts/lib/TaskEither"

export interface EventStore<T> {
	read(stream: string): TaskEither<Error, T[]>
	append(stream: string, events: T[]): TaskEither<Error, number>
}
