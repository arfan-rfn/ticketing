// import axios from 'axios';
// import BuildClient from '../api/build-client';
import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {

	const ticketList = tickets.map(ticket => {
		return (
			<tr key={ticket.id}>
				<td>{ticket.title}</td>
				<td>{ticket.price}</td>
				<td>
					<Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
						<a>Details</a>
					</Link>
				</td>
			</tr>
		);
	})

	return (
		<div>
			<h1>List of Tickets</h1>
			<table className="table">
				<thead>
					<tr>
						<th>Title</th>
						<th>Price</th>
						<th>Details</th>
					</tr>
				</thead>
				<tbody>
					{ticketList}
				</tbody>
			</table>
		</div>
	);
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
	// client, currentUser are coming form the _app getInitialProps.
	const { data } = await client.get('/api/tickets');

	return { tickets: data || [] };

	// Everything is now at BuildClient file now
	// if (typeof window === 'undefined') {
	// 	// we are on the server
	// 	// request should be made to ingress-nginx server which is located to other namespace
	// 	// url: http://<serviceName>.<Namespace>.svc.cluster.local
	// 	console.log('loading it on the server');
	// 	try {
	// 		const { data } = await axios.get(
	// 			'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser',
	// 			{
	// 				headers: req.headers
	// 			}
	// 		);
	// 		return data;

	// 	} catch (err) {
	// 		console.log(err);
	// 	}

	// } else {
	// 	// We are on the browser
	// 	// request can be made to the bae url
	// 	console.log('loading from other router');
	// 	try {
	// 		const { data } = await axios.get('/api/users/currentuser');
	// 		return data;

	// 	} catch (err) {
	// 		console.log(err);
	// 	}
	// }
	// return {};
}

export default LandingPage;