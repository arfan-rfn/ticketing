import { Publisher, Subjects, TicketUpdatedEvent } from "@micro-auth/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
	readonly subject = Subjects.TicketUpdated;
}