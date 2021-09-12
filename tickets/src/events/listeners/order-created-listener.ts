import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@micro-auth/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/tickets";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { orderQueueGroupName } from "./queue-group-name";


export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
	readonly subject = Subjects.OrderCreated;
	queueGroupName: string = orderQueueGroupName;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		// Find the ticket that the order is reserving
		const ticket = await Ticket.findById(data.ticket.id);

		// If no ticket, throw error
		if (!ticket) {
			throw new Error("Ticket not found");
		}

		// Mark the ticket as being reserved by setting it's orderId property
		ticket.set({ orderId: data.id });

		// Save the ticket
		await ticket.save();

		// Emit an event as the record changed
		await new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			price: ticket.price,
			title: ticket.title,
			userId: ticket.userId,
			orderId: ticket.orderId,
			version: ticket.version,
		});

		// act the message
		msg.ack();
	}

}