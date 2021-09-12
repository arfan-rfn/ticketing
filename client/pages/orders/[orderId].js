import { useEffect, useState } from 'react';
// import StripeCheckout from 'react-stripe-checkout';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order, currentUser }) => {

	const [timeLeft, setTimeLeft] = useState(0);
	const { doRequest, errors } = useRequest({
		url: '/api/payments',
		method: 'post',
		body: {
			orderId: order.id,
		},
		onSuccess: (payment) => Router.push('/orders'),
	});

	useEffect(() => {
		const findTimeLeft = () => {
			const msLeft = new Date(order.expireAt) - new Date();
			setTimeLeft(Math.round(msLeft / 1000));
		};

		findTimeLeft();
		const timerId = setInterval(findTimeLeft, 1000);

		return () => {
			clearInterval(timerId);
		}
	}, []);

	if (timeLeft < 0) {
		return <div>Order Expired</div>
	}

	return (
		<div>
			<div>
				Time left to pay: {timeLeft} seconds
			</div>
			<StripeCheckout
				token={({ id }) => doRequest({ token: id })}
				stripeKey="pk_test_51JWntmILLX6QHARXxDieusa3b4mF1AeeavGy1HK20SePIrSw0vsGINlRLicLWF3wa9gVbiaPACAWgrfqw3azTMjj00dgtq3JDb"
				amount={order.ticket.price * 1000}
				email={currentUser.email}
			/>
			{errors}
		</div>
	);
}

OrderShow.getInitialProps = async (context, client) => {
	const { orderId } = context.query;
	const { data } = await client.get(`/api/orders/${orderId}`);
	return { order: data };
}

export default OrderShow;