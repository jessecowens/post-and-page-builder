var BOLDGRID = BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

( function ( $ ) {
	"use strict"; 

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.CONTROLS.Container = {

		name : 'container',
		
		tooltip : 'Section Width',

		priority : 15,

		iconClasses : 'fa fa-arrows-h',

		selectors : [ '.boldgrid-section .container', '.boldgrid-section .container-fluid' ],

		init : function () {
			//BOLDGRID.EDITOR.Controls.registerControl( this );
		},

		onMenuClick : function () {
			self.toggleSectionWidth();
		},
		
		toggleSectionWidth : function ( $container ) {
			
			if ( ! $container ) {
				$container = BG.Controls.$menu
					.targetData[ self.name ].closest( '.container, .container-fluid' );
			}

			if ( $container.hasClass( 'container' ) ) {
				$container.addClass( 'container-fluid' );
				$container.removeClass( 'container' );
			} else {
				$container.addClass( 'container' );
				$container.removeClass( 'container-fluid' );
			}
		}
	};

	BOLDGRID.EDITOR.CONTROLS.Container.init();
	self = BOLDGRID.EDITOR.CONTROLS.Container;

} )( jQuery );