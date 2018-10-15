let $ = jQuery,
	BG = BOLDGRID.EDITOR;

export class Handle {
	constructor( options ) {
		options = { ...options, ...{} } || {};
		this.rowResize = BG.RESIZE.Row;

		this.position = options.position;
		this.cssProperty = options.cssProperty;
		this.tooltip = options.tooltip;
	}

	/**
	 * Render a single handle.
	 *
	 * @since 1.8.0
	 *
	 * @return {$} The element.
	 */
	render() {
		this.$element = $( `
			<div class="${this.position} resize-handle" title="${this.tooltip}" data-setting="${
			this.cssProperty
		}">
				<div class="draghandle">
					<span class="icon"></span>
					<span class="size"></span>
				</div>
				<div class="overlay"></div>
			</div>
		` );

		BG.RESIZE.Row.$container.find( 'body' ).after( this.$element );

		this.$overlay = this.$element.find( '.overlay' );
		this.$size = this.$element.find( '.size' );

		this.initDraggable();

		return this.$element;
	}

	/**
	 * Update the size displayed on screen.
	 *
	 * @since 1.8.0
	 */
	updateSizeDisplay( $target ) {
		this.$size.html( $target.css( this.cssProperty ) );
	}

	/**
	 * Update the handle position.
	 *
	 * @since 1.8.0
	 *
	 * @param  {object} cords   Row bounding rect.
	 */
	updatePosition( cords ) {
		let pos = cords ? cords : this.rowResize.$currentRow[0].getBoundingClientRect(),
			rightOffset = pos.right - this.rowResize.rightOffset,
			top = this.$element.hasClass( 'top' ) ? pos.top - 1 : pos.bottom + 1;

		this.$element.css( {
			top: top,
			left: rightOffset
		} );

		this._setOverlayPosition( pos );
	}

	/**
	 * Setup the drag and drop plugin.
	 *
	 * @since 1.8.0
	 */
	initDraggable() {
		let startPadding,
			originalPosition,
			setting = this.cssProperty;

		this.$element.draggable( {
			scroll: false,
			axis: 'y',

			start: ( e, ui ) => {
				this.rowResize.currentlyDragging = true;
				startPadding = parseInt( this.rowResize.$currentRow.css( this.cssProperty ) );
				this.rowResize.$currentRow.addClass( 'changing-padding' );
				BG.Controls.$container.$html.addClass( 'no-select-imhwpb' );
				BG.Controls.$container.$html.addClass( 'changing-' + this.cssProperty );
				BG.Controls.$container.trigger( 'bge_row_resize_start' );
			},

			stop: () => {
				BG.Controls.$container.trigger( 'bge_row_resize_end' );
				this.rowResize.currentlyDragging = false;
				this.rowResize.$currentRow.removeClass( 'changing-padding' );
				BG.Controls.$container.$html.removeClass( 'no-select-imhwpb' );
				BG.Controls.$container.$html.removeClass( 'changing-' + this.cssProperty );
				this.rowResize.positionHandles( this.rowResize.$currentRow );
			},

			drag: ( e, ui ) => {
				var padding,
					rowPos,
					relativePos,
					diff = ui.position.top - ui.originalPosition.top;

				if ( 'padding-top' === this.cssProperty ) {
					padding = parseInt( this.rowResize.$currentRow.css( this.cssProperty ) ) - diff;
					this.rowResize._syncBottomHandle( padding, diff );

					relativePos = 'top';
					if ( 0 < padding && diff ) {
						window.scrollBy( 0, -diff );
					}
				} else {
					padding = startPadding + diff;
					relativePos = 'bottom';
				}

				// If padding is less than 0, prevent movement of handle.
				if ( 0 > padding ) {
					rowPos = this.rowResize.$currentRow[0].getBoundingClientRect();
					ui.position.top = rowPos[relativePos];
					padding = 0;
				}

				this._updateOverlayCss( padding );

				this.$size.html( padding + 'px' );
				BG.Controls.addStyle( this.rowResize.$currentRow, this.cssProperty, padding );

				if ( BG.Controls.$container.$html.hasClass( 'editing-as-row' ) && $.fourpan ) {
					$.fourpan.refresh();
				}

				BG.Service.event.emit( 'rowResize', this.rowResize.$currentRow );
			}
		} );
	}

	/**
	 * Update the position of the overay for new elements.
	 *
	 * @since 1.8.0
	 *
	 * @param {string} Element CSS value.
	 */
	_setOverlayPosition( pos ) {
		let value = parseInt( this.rowResize.$currentRow.css( this.cssProperty ), 10 );

		this.$overlay.css( {
			width: pos.width,
			left: -pos.width + this.rowResize.rightOffset,
			height: value
		} );

		return value;
	}

	/**
	 * Update the css for the overlay. Used during drag increment/decrement.
	 *
	 * @since 1.8.0
	 */
	_updateOverlayCss( padding ) {
		this.$overlay.css( {
			height: padding
		} );
	}
}
