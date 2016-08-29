var BOLDGRID = BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

( function ( $ ) {
	"use strict"; 

	var self,
		BG = BOLDGRID.EDITOR; 

	BOLDGRID.EDITOR.CONTROLS.Add = {
			
		$element : null,

		name : 'add',
		
		tooltip : 'Add New Item',

		priority : 1,

		iconClasses : 'genericon genericon-plus add-element-trigger',

		selectors : [ '*' ],
		
		menuDropDown : {
			title: 'Add New',
			options: [
				{
					'name' : 'Button',
					'class' : 'action font-awesome add-button'
				},
				{
					'name' : 'Icon',
					'class' : 'action font-awesome add-icon'
				},
				{
					'name' : 'GridBlock',
					'class' : 'action add-gridblock'
				},
				{
					'name' : 'Section',
					'class' : 'action add-row'
				}
			]
		},
		
		init : function () {
			BOLDGRID.EDITOR.Controls.registerControl( this );
		},
		
		onMenuClick : function ( e ) {
			var $this = $( this ); 
			$this.toggleClass('active');
		},
		
		setup : function () {
			self.$element = $( '[data-action="menu-add"]' );

			self._setupDimiss();
			self._setupMenuClick();
		},
		
		elementClick : function () {
			self.$element.removeClass('active');
		},
		
		_setupMenuClick : function () {
			BG.Menu.$element.find('.bg-editor-menu-dropdown')
				.on( 'click', '.action.add-gridblock', self.addGridblock )
				.on( 'click', '.action.add-row', self.addSection )
				.on( 'click', '.action.add-button', self.addButton )
				.on( 'click', '.action.add-icon', self.addIcon );
		},

		_setupDimiss : function () {
			$( document ).on( 'click', function ( e ) {
				if ( false === $( e.target ).hasClass( 'add-element-trigger' ) ) {
					self.$element.removeClass('active');
				}
			} );
		},
		
		addIcon : function () {
			BG.CONTROLS.Icon.insertNew();
		},
		
		addButton : function () {
			BG.CONTROLS.Button.insertNew();
		},
		
		scrollToElement : function ( $newSection, duration ) {
			
			$('html, body').animate({
					scrollTop: $newSection.offset().top
			}, duration );
		},
		
		addSection : function () {
			var $container = BOLDGRID.EDITOR.Controls.$container,
				$newSection = $( wp.template('boldgrid-editor-empty-section')() ) ;
			$container.$body.append( $newSection );
			
			self.scrollToElement( $newSection, 200 );
			 
			IMHWPB.tinymce_undo_disabled = true;
			$newSection.animate( {
				    'background-color' : 'transparent'
				  }, 1500, 'swing', function(){
						BG.Controls.addStyle( $newSection, 'background-color', '' );
						IMHWPB.tinymce_undo_disabled = false;
						tinymce.activeEditor.undoManager.add();
				  }
			);
		},
		
		addGridblock : function () {
			var mce = BOLDGRID.EDITOR.Controls.editorMceInstance();
			if ( mce ) {
				mce.insert_layout_action();
			}
		}
	};

	BOLDGRID.EDITOR.CONTROLS.Add.init();
	self = BOLDGRID.EDITOR.CONTROLS.Add;

} )( jQuery );