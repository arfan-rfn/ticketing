import axios from 'axios';

const BuildClient = ({ req }) => {
	if (typeof window === 'undefined') {
		// we are in the server
		return axios.create({
			baseURL: 'http://www.onebyo.com',
			headers: req.headers
		});

	} else {
		// we are in the client
		return axios.create({
			baseURL: '/',
		});
	}
}

export default BuildClient;