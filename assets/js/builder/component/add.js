import panelTemplate from './add.html';
import './add.scss';
import { Drag } from './drag.js';

window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
let $ = jQuery,
	BG = BOLDGRID.EDITOR;

export class Add {
	constructor() {

		// Menu Configurations.
		this.name = 'add';
		this.$element = null;
		this.tooltip = 'Add Block Component';
		this.priority = 1;
		this.iconClasses = 'genericon genericon-plus add-element-trigger';
		this.selectors = [ 'html' ];

		// Panel Configurations.
		this.panel = {
			title: 'Block Components',
			height: '640px',
			width: '500px'
		};

		this.defaults = {
			type: 'design',
			insertType: 'drag',
			onClick: component => this.sendToEditor( component ),
			onDragDrop: ( component, $el ) => this.openCustomization( component, $el )
		};

		this.components = [];

		this.dragHandler = new Drag();
	}

	/**
	 * Instantiate this service.
	 *
	 * @return {Add} Class instance.
	 */
	init() {
		BOLDGRID.EDITOR.Controls.registerControl( this );

		this.dragHandler.bindBaseEvents();

		return this;
	}

	/**
	 * Add a new component to the list.
	 *
	 * @since 1.8.0
	 *
	 * @param  {object} config List of control.s
	 */
	register( config ) {
		this.components.push( { ...this.defaults, ...config } );
	}

	/**
	 * Create the option UI.
	 *
	 * @since 1.8.0
	 *
	 * @return {jQuery} jQuery Control object.
	 */
	createUI() {
		if ( this.$ui ) {
			return this.$ui;
		}

		// Alphabetical order.
		this.components = _.sortBy( this.components, val => val.title );

		this.$ui = $(
			_.template( panelTemplate )( {
				sections: BoldgridEditor.plugin_configs.component_controls.types,
				components: this.components,
				printComponent: function( type, component ) {
					if ( type === component.type ) {
						return `
						<label ${'drag' === component.insertType ? 'draggable="true"' : ''} data-name="${component.name}"
							data-insert-type="${component.insertType}">
							<span class="dashicons dashicons-external component-popup"></span>
							<span class="dashicons dashicons-plus-alt insert-component"></span>
							<span class="component-icon">${component.icon}</span>
							<span class="component-name">${component.title}</span>
						</label>`;
					}
				}
			} )
		);

		return this.$ui;
	}

	/**
	 * Setup the handlers for all components.
	 *
	 * @since 1.8.0
	 */
	_bindHandlers() {
		let $context = BG.Panel.$element.find( '.bg-component' );
		for ( let component of this.components ) {
			let selector = `
					[data-name="${component.name}"] .insert-component,
					[data-name="${component.name}"][data-insert-type="popup"]
				`;

			$context.find( selector ).on( 'click', e => {
				BG.Service.component.validateEditor();
				component.onClick( component );
			} );

			this.dragHandler.bindStart( component );
		}

		this.setupAccordion( $context );
	}

	/**
	 * Default process to occur when a component is clicked.
	 *
	 * @since 1.8.0
	 *
	 * @param  {object} component Component Configs.
	 */
	sendToEditor( component ) {
		let $inserted,
			$html = component.getDragElement();

		$html.addClass( 'bg-inserted-component' );

		// Prepend the first column on the page with the new component.
		if ( 'prependColumn' === component.onInsert ) {
			this.prependContent( $html );

			BG.Service.component.scrollToElement( $html, 200 );
			BG.Service.popover.section.transistionSection( $html, '#eeeeee' );

			// Call the function.
		} else if ( component.onInsert ) {
			component.onInsert( $html );

			// Insert the HTML.
		} else {
			send_to_editor( $html[0].outerHTML );
		}

		$inserted = BG.Controls.$container.find( '.bg-inserted-component' ).last();
		$inserted.removeClass( 'bg-inserted-component' );

		this.openCustomization( component, $inserted );
	}

	/**
	 * Add a jQuery element to the first column on the page.
	 *
	 * @since 1.8.0
	 *
	 * @param  {jQuery} $html Element.
	 */
	prependContent( $html ) {
		BG.Controls.$container.$body
			.find( '[class*="col-md-"]' )
			.first()
			.prepend( $html );
	}

	/**
	 * Open the customization panel for a component.
	 *
	 * @since 1.8.0
	 *
	 * @param  {object} component Component Configs.
	 * @param  {jQuery} $inserted Element to focus.
	 */
	openCustomization( component, $inserted ) {
		let control = BG.Controls.get( component.name );

		if ( control ) {
			BG.Controls.$menu.targetData[component.name] = $inserted;
			$inserted.click();
			control.onMenuClick();
		}
	}

	/**
	 * Scroll to an element on the iFrame.
	 *
	 * @since 1.2.7
	 */
	scrollToElement( $newSection, duration ) {
		$( 'html, body' ).animate(
			{
				scrollTop: $newSection.offset().top
			},
			duration
		);
	}

	/**
	 * Make sure that the editor is not in a state where we cannot add new elements.
	 *
	 * @since 1.8.0
	 */
	validateEditor() {
		if ( ! BG.Controls.$container.$body.html() ) {
			BG.Controls.$container.$body.prepend( '<p></p>' );
		}

		BG.Controls.$container.validate_markup();
	}

	/**
	 * Bind the click event for the accordion headings.
	 *
	 * @since 1.8.0
	 *
	 * @param  {jQuery} $context Element.
	 */
	setupAccordion( $context ) {
		$context.find( '.component-heading' ).on( 'click', e => {
			let $target = $( e.currentTarget );
			$target
				.next( '.bg-component-list' )
				.stop()
				.slideToggle( 'fast', () => {
					$target.toggleClass( 'collapsed', ! $target.next( '.bg-component-list' ).is( ':visible' ) );
				} );
		} );
	}

	/**
	 * When the user clicks on the menu, open the panel.
	 *
	 * @since 1.8.0
	 */
	onMenuClick() {
		this.openPanel();
	}

	/**
	 * Open Panel.
	 *
	 * @since 1.8.0
	 */
	openPanel() {
		let $control = this.createUI();

		BG.Panel.clear();
		BG.Panel.$element.find( '.panel-body' ).html( $control );
		BG.Panel.open( this );

		this._bindHandlers();
	}
}