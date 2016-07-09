import {createPassThroughPipeline} from './pipeline';

let launched = false;

const routes = {};

export const route = {
	EXIT: Symbol('onExit'),
	ERROR: Symbol('onError'),
	LAUNCH: Symbol('onLaunch'),
	RELOAD: Symbol('onReload'),
	RESUME: Symbol('onResume'),
	SUSPEND: Symbol('onSuspend'),
	NOT_FOUND: Symbol('Not found'),
};

const routeMapping = {
	onExit: route.EXIT,
	onError: route.ERROR,
	onLaunch: route.LAUNCH,
	onReload: route.RELOAD,
	onResume: route.RESUME,
	onSuspend: route.SUSPEND,
};

const nameMapping = Object
	.keys(routeMapping)
	.concat(Object.keys(route))
	.reduce((result, name) => {
		result[routeMapping[name] || route[name]] = name;
		return result;
	}, {});

export function handleRoute(routeName) {
	if (!routeName) {
		throw new Error('Route handler need route to process');
	}

	if (typeof(routeName) === 'function' && !route[routeName]) {
		throw new Error(`Route handler can't process unknown custom handler`);
	}

	if (routes[routeName]) {
		throw new Error(`Handler for "${routeName}" is already specified`);
	}

	return routes[routeName] = createPassThroughPipeline();
}

export function navigate(routeName, params) {
	if (!launched) {
		throw new Error(`Can't process navigation before app is launched`);
	}

	let targetRoute = routes[routeName];

	if (targetRoute) {
		return targetRoute.sink({navigation: params});
	}

	if (routeName !== route.NOT_FOUND) {
		return navigate(route.NOT_FOUND, params);
	}

	throw new Error(`Unable to resolve route "${nameMapping[routeName] || routeName}"`);
}

export function pushDocument(payload) {
	let {document} = payload;

	if (!document) {
		throw new Error('Unable to push undefined document');
	}

	navigationDocument.pushDocument(document);
	return payload;
}

export function replaceDocument(payload) {
	let {document} = payload;

	if (!document) {
		throw new Error('Unable to replace undefined document');
	}

	navigationDocument.replaceDocument(document);
	return payload;
}

Object
	.keys(routeMapping)
	.forEach(name => {
		let symbol = routeMapping[name];
		let targetRoute = routes[symbol];

		App[name] = navigation => {
			if (name === 'onLaunch') {
				launched = true;
			}
			targetRoute && targetRoute.sink({navigation});
		}
	});