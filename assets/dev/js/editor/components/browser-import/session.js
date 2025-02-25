export default class Session {
	/**
	 * The Manager instance.
	 *
	 * @type {Manager}
	 */
	manager;

	/**
	 * The ItemCollection instance.
	 *
	 * @type {ItemCollection}
	 */
	itemCollection;

	/**
	 * The Target instance.
	 *
	 * @type {Container}
	 */
	target;

	/**
	 * The Session options.
	 *
	 * @type {{}}
	 */
	options = {
		target: {},
	};

	/**
	 * Session constructor.
	 *
	 * @param manager
	 * @param itemCollection
	 * @param target
	 * @param options
	 */
	constructor( manager, itemCollection = null, target = null, options = {} ) {
		this.manager = manager;
		this.itemCollection = itemCollection;
		this.target = target;

		Object.assign( this.options, options );
	}

	/**
	 * Validate all files in this session can be handled.
	 *
	 * @returns {boolean}
	 */
	async validate() {
		for ( const item of this.itemCollection.getItems() ) {
			if ( ! await this.manager.getReaderOf( item ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Handle files with a suitable file-parser.
	 *
	 * @returns {Container[]}
	 */
	async apply() {
		const parsed = [];

		for ( const item of this.itemCollection.getItems() ) {
			const parser = await this.manager.getParserOf( item, true );

			if ( parser ) {
				parsed.push( parser.parse() );
			} else {
				throw new Error( 'An error occurred when trying to parse the input' );
			}
		}

		return Promise.all( parsed )
			.then( ( result ) => this.resolve( result.flat() ) );
	}

	/**
	 * Resolve containers to fulfill their purpose.
	 *
	 * @param containers
	 * @returns {*}
	 */
	resolve( containers ) {
		return containers.map( ( element ) => {
			switch ( element.type ) {
				case 'container':
				case 'section':
				case 'column':
				case 'widget':
					return this.target.view.createElementFromContainer(
						element,
						Object.assign( this.options.target, {
							event: this.options.event,
						} )
					);
			}
		} );
	}
}
