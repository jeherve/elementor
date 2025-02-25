import AddSectionView from './add-section/independent';

const BaseSectionsContainerView = require( 'elementor-views/base-sections-container' );

const Preview = BaseSectionsContainerView.extend( {
	initialize: function() {
		this.$childViewContainer = jQuery( '<div>', { class: 'elementor-section-wrap' } );

		BaseSectionsContainerView.prototype.initialize.apply( this, arguments );
	},

	getChildViewContainer: function() {
		return this.$childViewContainer;
	},

	behaviors: function() {
		var parentBehaviors = BaseSectionsContainerView.prototype.behaviors.apply( this, arguments ),
			behaviors = {
				contextMenu: {
					behaviorClass: require( 'elementor-behaviors/context-menu' ),
					groups: this.getContextMenuGroups(),
				},
			};

		return jQuery.extend( parentBehaviors, behaviors );
	},

	getContainer() {
		return elementor.settings.page.getEditedView().getContainer();
	},

	getContextMenuGroups: function() {
		var hasContent = function() {
			return elementor.elements.length > 0;
		};

		return [
			{
				name: 'paste',
				actions: [
					{
						name: 'paste',
						title: __( 'Paste', 'elementor' ),
						isEnabled: () => $e.components.get( 'document/elements' ).utils.isPasteEnabled( this.getContainer() ),
						callback: ( at ) => $e.run( 'document/ui/paste', {
							container: this.getContainer(),
							options: {
								at,
								rebuild: true,
							},
						} ),
					},
				],
			}, {
				name: 'content',
				actions: [
					{
						name: 'copy_all_content',
						title: __( 'Copy All Content', 'elementor' ),
						isEnabled: hasContent,
						callback: () => $e.run( 'document/elements/copy-all' ),
					}, {
						name: 'delete_all_content',
						title: __( 'Delete All Content', 'elementor' ),
						isEnabled: hasContent,
						callback: () => $e.run( 'document/elements/empty' ),
					},
				],
			},
		];
	},

	createElementFromModel: function( model, options = {} ) {
		const shouldWrap = ! [ 'container', 'section' ].includes( model.elType || model?.get( 'elType' ) );

		if ( ! shouldWrap ) {
			delete options.at;
		}

		return BaseSectionsContainerView.prototype.createElementFromModel.call(
			this,
			model,
			{ ...options, shouldWrap },
		);
	},

	onRender: function() {
		let $contentContainer;

		if ( elementorCommon.config.experimentalFeatures[ 'e_dom_optimization' ] ) {
			$contentContainer = this.$el;
		} else {
			const $inner = jQuery( '<div>', { class: 'elementor-inner' } );

			this.$el.html( $inner );

			$contentContainer = $inner;
		}

		$contentContainer.html( this.$childViewContainer );

		if ( elementor.userCan( 'design' ) ) {
			const addNewSectionView = new AddSectionView();

			addNewSectionView.render();

			$contentContainer.append( addNewSectionView.$el );
		}
	},
} );

module.exports = Preview;
