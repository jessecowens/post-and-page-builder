var BOLDGRID = BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.CONTROLS = BOLDGRID.EDITOR.CONTROLS || {};

( function ( $ ) {
	"use strict"; 
	
	var self;

	BOLDGRID.EDITOR.CONTROLS.ImageFilter = {

		name : 'image-filter',
		
		priority : 90,
		
		iconClasses : 'genericon genericon-image',
		
		tooltip : 'Image Filter',
		
		/**
		 * List of all Caman values.
		 */
		sliderHistory : {},
		
		/**
		 * Caman object use for previews.
		 */
		preview : null,

		presetIntensity : '50%',

		/**
		 * Properties for a panel.
		 */
		panel : {
			title : 'Image Filters',
			height : '536px',
			width : '800px',
		},

		/**
		 * Selectors that are eligble for image filters.
		 */
		selectors : [ 'img' ],
		
		/**
		 * List of Presets.
		 */
		presets : [
			{ name : 'none', title : 'None' },
			{ name : 'vintage', title : 'Vintage' },
			{ name : 'lomo', title : 'Lomo' },
			{ name : 'clarity', title : 'Clarity' },
			{ name : 'sinCity', title : 'Sin City' },
			{ name : 'sunrise', title : 'Sunrise' },
			{ name : 'crossProcess', title : 'Cross Process' },
			{ name : 'orangePeel', title : 'Orange Peel' },
			{ name : 'love', title : 'Love' },
			{ name : 'grungy', title : 'Grungy' },
			{ name : 'jarques', title : 'Jarques' },
			{ name : 'pinhole', title : 'Pinhole' },
			{ name : 'oldBoot', title : 'Old Boot' },
			{ name : 'glowingSun', title : 'Glowing Sun' },
			{ name : 'hazyDays', title : 'Hazy Days' },
			{ name : 'herMajesty', title : 'Her Majesty' },
			{ name : 'nostalgia', title : 'Nostalgia' },
			{ name : 'hemingway', title : 'Hemingway' },
			{ name : 'concentrate', title : 'Concentrate' }
		],
		
		/**
		 * List of custom controls and their ranges.
		 */
		customizeSettings : {
			'brightness' : { title : 'Brightness', range : { min : -50, max : 50 } },
			'vibrance' : { title : 'Vibrance', range : { min : -50, max : 50 } },
			'contrast' : { title : 'Contrast', range : { min : -10, max : 10 } },
			'saturation' : { title : 'Saturation', range : { min : -50, max : 50 } },
			'exposure' : { title : 'Exposure', range : { min : -50, max : 50 } },
			'hue' : { title : 'Hue', range : { min : 0, max : 100 } },
			'gamma' : { title : 'Gamma', range : { min : 1, max : 4, val : 1 } },
			'clip' : { title : 'Clip', range : { min : 0, max : 50 } },
			'stackBlur' : { title : 'Blur', range : { min : 0, max : 30 } },
			'sepia' : { title : 'Sepia', range : { min : 0, max : 100 } },
			'noise' : { title : 'Noise', range : { min : 0, max : 50 } },
			'sharpen' : { title : 'Sharpen', range : { min : 0, max : 50 } }
		},

		/**
		 * Register this class as a control.
		 */
		init : function () {
			BOLDGRID.EDITOR.Controls.registerControl( this );
		},
		
		
		/**
		 * Bind Handlers.
		 */
		setup : function () {
			self._setupInsertClick();
			self._setupToggleCustomize();
			self._setupPanelClick();
		},

		/**
		 * When the user toggles between the presets and custom options.
		 */
		_setupToggleCustomize : function() {
			var preset,
				panel = BOLDGRID.EDITOR.Panel,
				menu = BOLDGRID.EDITOR.Menu;
			
			panel.$element.on( 'click', '.presets .activate-customize', function () {
				panel.$element.find( '.choices' ).addClass( 'customizing' );
				self.preview.revert();
				self.applySliderSettings();
			} );
			
			panel.$element.on( 'click', '.customize .activate-presets', function () {
				panel.$element.find( '.choices' ).removeClass( 'customizing' );
				self.preview.revert();
				
				preset = panel.$element.find( '.selected' ).data( 'preset' );
				if ( ! preset ) {
					panel.clearSelected();
					panel.$element.find( '[data-preset="none"]' ).addClass( 'selected' );
				} else {
					self.renderPreset( preset );
				}
			} );
		},
		
		renderPreset : function ( preset ) {
			var panel = BOLDGRID.EDITOR.Panel;
			
			panel.$element.addClass( 'rendering' );
			self.preview.revert( false );
			self.preview[ preset ]( self.presetIntensity ).render( function ( e ) {
				panel.$element.removeClass( 'rendering' );
			} );
		},
		
		/**
		 * When the user clicks on a selection within the panel. Select the element.
		 */
		_setupPanelClick : function() {
			var panel = BOLDGRID.EDITOR.Panel,
				menu = BOLDGRID.EDITOR.Menu;
			
			panel.$element.on( 'click', '.image-filter .panel-selection', function () {
				var $this = $( this ),
					$target = panel.$element.find( '.preview' ).find( 'img, canvas' ),
					preset = $this.data( 'preset' );

				panel.clearSelected();
				$this.addClass( 'selected' );

				if ( 'none' != preset ) {
					self.renderPreset( preset );
				} else {
					self.preview.revert();
				}
			} );
		},
		
		/**
		 * When the user clicks on the insert button, run insert image.
		 */
		_setupInsertClick :function () {
			BOLDGRID.EDITOR.Panel.$element.on( 'click', '.preview .insert-image', function () {
				self.insertImage();
			} );
		},
		
		/**
		 * Create jQuery UI Sliders.
		 */
		_setupSliders : function() {
			self.sliderHistory = {};
			
			BOLDGRID.EDITOR.Panel.$element.find( '.slider' ).each( function () {
				var $this = $( this ),
					control = $this.data( 'control' ),
					range = self.customizeSettings[ control ].range;
				
				$this.slider( {
					'min' : range.min,
					'max' : range.max,
					'value' : range.val || 0,
					'change' : function ( e, ui ) {
						self.sliderHistory[ control ] = ui.value;
						self.applySliderSettings();
					},
				} );
			} );
		},
		
		applySliderSettings : function () {
			self.preview.revert( false );
			$.each( self.sliderHistory, function ( control ) {
				self.preview[ control ]( this );
			} );
			self.preview.render();
		},
		
		/**
		 * Insert the image into the post.
		 */
		insertImage : function () {
			var panel = BOLDGRID.EDITOR.Panel,
				$target = BOLDGRID.EDITOR.Menu.getTarget( self );
			
			panel.$element.addClass( 'rendering' );
			
			$.ajax( {
				type: 'post',
				url: ajaxurl,
				dataType : 'json',
				data: { 
					action: 'boldgrid_canvas_image',
					attachement_id: $target.attachment_id,
					image_data: self.preview.canvas.toDataURL()
			  },
			  success : function ( response ) {
				if ( response && response.success ) {
					
					// Update image in editor.
					$target.removeClass( 'wp-image-' + $target.attachment_id );
					$target.addClass( 'wp-image-' + response.attachment_id );
					$target.attachment_id = response.attachment_id;
					$target.attr( 'src', response.url );
					$target.attr( 'data-mce-src', response.url );

					// Update list of images that exists on the page.
					BoldgridEditor.images = response.images;
				  }
			  }
			} ).always( function () {
				panel.$element.removeClass( 'rendering' );
			} );
		},
		
		/**
		 * When the user clicks on an image, if the panel is open, set panel content.
		 */
		elementClick : function() {
			if ( BOLDGRID.EDITOR.Panel.isOpenControl( this ) ) {
				self.openPanel();
			}
		},
		
		/**
		 * Process all thubmnails on the panel.
		 */
		_renderPanelThumbnails : function () {
			var process,
				count = 1;
			
			process = function () {
				Caman( '[data-preset="' + self.presets[ count ].name + '"] img', function () {
					this[ self.presets[ count ].name ]( '50%' ).render( function () {
						count++;
						if ( self.presets[ count ] ) {
							process();
						}
					} );
				} );
			};
			
			process();
		},
		
		/**
		 * Get the image src for the given target. Finding the thumbnail if available.
		 */
		get_image_src : function () {
			var src,
				$target = BOLDGRID.EDITOR.Menu.getTarget( self ),
				fullSrc = $target.attr( 'src' );
			
			$.each( BoldgridEditor.images, function () {
				if ( $target.hasClass( 'wp-image-' + this.attachment_id ) ) {
					$target.attachment_id = this.attachment_id;
					src = this.thumbnail;
					return false;
				}
			} );

			if ( ! src ) {
				src = fullSrc;
			}
			
			return {
				src : src,
				fullSrc : fullSrc,
			};
		},
		
		/**
		 * Open the panel for the given target.
		 */
		openPanel : function () {
			var srcSet,
				panel = BOLDGRID.EDITOR.Panel,
				template = wp.template( 'boldgrid-editor-image-filter' );

			// Remove all content from the panel.
			panel.clear();
			
			srcSet = this.get_image_src();
	
			//TODO: isRemote(img)
	
			// Set markup for panel.
			panel.$element.find( '.panel-body' ).html( template( {
				'fullSrc' : srcSet.fullSrc,
				'src' : srcSet.src,
				'presets' : self.presets,
				'customizeSettings' : self.customizeSettings
			} ) );
			
			// Intialize Sliders.
			self._setupSliders();
			self._renderPanelThumbnails();
	
			// Initialize Preview Image.
			panel.$element.find( '[data-preset="none"]' ).addClass( 'selected' );
			self.preview = Caman( panel.$element.find( '.preview img' )[0] );
	
			tinyMCE.activeEditor.selection.collapse(false);

			// Open Panel.
			panel.open( self );
			panel.centerPanel();
		},
		
		/**
		 * When the user clicks on the menu.
		 */
		onMenuClick : function () {
			self.openPanel();
		}

	};

	BOLDGRID.EDITOR.CONTROLS.ImageFilter.init();
	self = BOLDGRID.EDITOR.CONTROLS.ImageFilter;

} )( jQuery );