import { Publisher, Subjects, TicketCreatedEvent } from "@micro-auth/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
	readonly subject = Subjects.TicketCreated;
}