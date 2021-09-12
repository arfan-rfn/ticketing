import 'bootstrap/dist/css/bootstrap.css';
import BuildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
	return <div>
		<Header currentUser={currentUser} />
		<div className="container">
			<Component currentUser={currentUser} {...pageProps} />
		</div>
	</div>
}

AppComponent.getInitialProps = async (appContext) => {
	// console.log(appContext);
	const client = BuildClient(appContext.ctx);
	try {
		const { data } = await client('/api/users/currentuser');

		let pageProps = {};
		if (appContext.Component.getInitialProps) {
			pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
		}
		console.log(pageProps);
		console.log(data);
		return {
			pageProps,
			...data
		};

	} catch (error) {
		console.log(error);
	}
	return {};
}

export default AppComponent;