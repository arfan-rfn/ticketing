import { PaymentCreatedEvent, Publisher, Subjects } from "@micro-auth/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
	readonly subject = Subjects.PaymentCreated;
}