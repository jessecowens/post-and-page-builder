window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.RESIZE = BOLDGRID.EDITOR.RESIZE || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.RESIZE.Row = {
		$body: null,

		handleSize: 20,

		$container: null,

		$topHandle: null,

		$bottomHandle: null,

		handleOffset: null,

		currentlyDragging: false,

		$currentRow: null,

		/**
		 * Initialize Row Resizing.
		 * This control adds padding top and bottom to containers.
		 *
		 * @since 1.2.7
		 */
		init: function( $container ) {
			self.$container = $container;
			self.handleOffset = self.handleSize;
			self.createHandles();
			self.initDraggable();
		},

		/**
		 * Attach drag handle controls to the DOM.
		 *
		 * @since 1.2.7
		 */
		createHandles: function() {
			self.$topHandle = $(
				`
				<div class="resize-handle top" title="Drag Resize Row" data-setting="padding-top">
					<span class="draghandle"></span>
					<span class="size">20px</span>
				</div>
				`
			);
			self.$bottomHandle = $(
				`
					<div class="resize-handle bottom" title="Drag Resize Row" data-setting="padding-bottom">
						<span class="draghandle"></span>
						<span class="size">20px</span>
					</div>
				`
			);

			self.$topHandle[0].$size = self.$topHandle.find( '.size' );
			self.$bottomHandle[0].$size = self.$bottomHandle.find( '.size' );

			self.$container
				.find( 'body' )
				.after( self.$topHandle )
				.after( self.$bottomHandle );

			self.hideHandles();
		},

		/**
		 * Handle the drag events.
		 *
		 * @since 1.2.7
		 */
		initDraggable: function() {
			var startPadding, setting;

			self.$container.find( '.resize-handle' ).draggable( {
				scroll: false,
				axis: 'y',
				start: function() {
					self.currentlyDragging = true;
					setting = $( this ).data( 'setting' );
					startPadding = parseInt( self.$currentRow.css( setting ) );
					self.$currentRow.addClass( 'changing-padding' );
					self.$container.$html.addClass( 'no-select-imhwpb' );
					self.$container.$html.addClass( 'changing-' + setting );
					BG.Controls.$container.trigger( 'bge_row_resize_start' );
				},
				stop: function() {
					BG.Controls.$container.trigger( 'bge_row_resize_end' );
					self.currentlyDragging = false;
					self.$currentRow.removeClass( 'changing-padding' );
					self.$container.$html.removeClass( 'no-select-imhwpb' );
					self.$container.$html.removeClass( 'changing-' + setting );
					self.positionHandles( self.$currentRow );
				},
				drag: function( e, ui ) {
					var padding,
						rowPos,
						relativePos,
						diff = ui.position.top - ui.originalPosition.top;

					if ( 'padding-top' === setting ) {
						padding = parseInt( self.$currentRow.css( setting ) ) - diff;
						self._syncBottomHandle( padding, diff );

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
						rowPos = self.$currentRow[0].getBoundingClientRect();
						ui.position.top =
							rowPos[relativePos] - ( ui.helper.hasClass( 'top' ) ? 0 : self.handleOffset );
						padding = 0;
					}

					ui.helper[0].$size.html( padding + 'px' );
					BG.Controls.addStyle( self.$currentRow, setting, padding );

					if ( self.$container.$html.hasClass( 'editing-as-row' ) && $.fourpan ) {
						$.fourpan.refresh();
					}

					BG.Service.event.emit( 'rowResize', self.$currentRow );
				}
			} );
		},

		/**
		 * When the top handle is dragged, update the bottom handle.
		 *
		 * This is done because the fixed positioning of each means that adding
		 * padding to the top changes the position of the bottom.
		 *
		 * @since 1.8.0
		 */
		_syncBottomHandle( padding, diff ) {
			if ( 0 <= padding ) {
				let currentTop = parseInt( self.$bottomHandle.css( 'top' ), 10 );

				/*
				 * If possible, apply the diff to the other handle.
				 * In the case of negetive padding to a hard update. This optiomization
				 * prevents a repaint and stuttering.
				 */
				self.$bottomHandle.css( 'top', currentTop - diff );
			} else {
				self.updateHandlePosition( self.$bottomHandle );
			}
		},

		/**
		 * Update the handle position.
		 *
		 * @since 1.8.0
		 *
		 * @param  {jQuery} $handle Handle to update.
		 * @param  {object} cords   Row bounding rect.
		 */
		updateHandlePosition: function( $handle, cords ) {
			let pos = cords ? cords : self.$currentRow[0].getBoundingClientRect(),
				rightOffset = pos.right - 100,
				top = $handle.hasClass( 'top' ) ? pos.top - 1 : pos.bottom - self.handleOffset + 1;

			$handle.css( {
				top: top,
				left: rightOffset
			} );
		},

		/**
		 * Reposition the handles.
		 *
		 * @since 1.2.7
		 */
		positionHandles: function( $this ) {
			var pos, rightOffset;

			if ( ! $this || ! $this.length ) {
				self.$topHandle.hide();
				self.$bottomHandle.hide();
				return;
			}

			if ( self.currentlyDragging ) {
				return false;
			}

			pos = $this[0].getBoundingClientRect();

			// Save the current row.
			self.$currentRow = $this;

			this.updateHandlePosition( self.$topHandle, pos );
			this.updateHandlePosition( self.$bottomHandle, pos );

			// Set the size text box
			self.$topHandle[0].$size.html( self.$currentRow.css( 'padding-top' ) );
			self.$bottomHandle[0].$size.html( self.$currentRow.css( 'padding-bottom' ) );

			self.$topHandle.show();
			self.$bottomHandle.show();
		},

		/**
		 * Hide the drag handles.
		 *
		 * @since 1.2.7
		 */
		hideHandles: function() {
			if ( self.currentlyDragging ) {
				return false;
			}

			self.$topHandle.hide();
			self.$bottomHandle.hide();
		}
	};

	self = BOLDGRID.EDITOR.RESIZE.Row;
} )( jQuery );
