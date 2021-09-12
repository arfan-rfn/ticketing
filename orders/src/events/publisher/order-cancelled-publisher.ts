import { OrderCancelledEvent, Publisher, Subjects } from "@micro-auth/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
	readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

}