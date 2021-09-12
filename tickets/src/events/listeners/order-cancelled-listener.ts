import { Listener, OrderCancelledEvent, Subjects } from "@micro-auth/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/tickets";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { orderQueueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
	readonly subject = Subjects.OrderCancelled;
	queueGroupName = orderQueueGroupName;

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		// Find the ticket
		const ticket = await Ticket.findById(data.ticket.id);

		if (!ticket) {
			throw new Error("Ticket not found");
		}

		ticket.set({ orderId: undefined });

		await ticket.save();

		new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			orderId: ticket.orderId,
			userId: ticket.userId,
			price: ticket.price,
			title: ticket.title,
			version: ticket.version,
		});

		msg.ack();
	}

}