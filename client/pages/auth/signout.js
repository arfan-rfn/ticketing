import { useEffect } from 'react';
import Router from 'next/router';
import UseRequest from '../../hooks/use-request';

const signOut = () => {
	const { doRequest } = UseRequest({
		url: '/api/users/signout',
		method: 'post',
		body: {},
		onSuccess: () => Router.push('/')
	});

	useEffect(() => {
		try {
			doRequest();
		} catch (error) {

		}
	}, []);

	return <div>Signing you out ...</div>
}

export default signOut;