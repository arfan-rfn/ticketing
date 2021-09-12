import { ExpirationCompleteEvent, Publisher, Subjects } from "@micro-auth/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
	readonly subject = Subjects.ExpirationComplete;
}