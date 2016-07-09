import assign from 'object-assign';

export function createPipeline(chain = [], passthrough) {
	const pipeline = (...args) => (payload) => {
		return chain.reduce((target, handler) => {
			return target.then(handler);
		}, Promise.resolve(assign({}, payload, {args})));
	};

	return assign(pipeline, {
		pipe(handler) {
			if (passthrough) {
				chain.push(handler);
				return this;
			}
			return createPipeline(chain.concat(handler));
		},

		sink(payload) {
			return pipeline()(payload);
		},
	});
}

export function createPassThroughPipeline(chain = []) {
	return createPipeline(chain, true);
}