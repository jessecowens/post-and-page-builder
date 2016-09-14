<?php
/**
 * Class: Boldgrid_Editor_Builder_Fonts
 *
 * Add functionality for fully customizable editor pages.
 *
 * @since      1.3
 * @package    Boldgrid_Editor
 * @subpackage Boldgrid_Editor_Builder_Fonts
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Boldgrid_Editor_Builder_Fonts
 *
 * Add functionality for fully customizable editor pages.
 *
 * @since      1.3
 */
class Boldgrid_Editor_Builder_Fonts {


	public function print_font_request() {

	}

	public function format_fonts() {

	}

	public function merge_fonts() {

	}

	public function parse_fonts( $html ) {
		$fonts = array();

		$dom = new DOMDocument();

		@$dom->loadHTML( $html );

		$xpath = new DOMXPath( $dom );

		// traverse all results
		foreach ( $xpath->query( "//*[@data-font-family]" ) as $rowNode ) {
			$fonts[] = $rowNode->getAttribute('data-font-family');
		}

		return $fonts;
	}

	public function create_font_url( $fonts ) {
		$base_url = 'https://fonts.googleapis.com/css?';
		$href = implode( '|', $fonts );
		$href = $base_url . http_build_query( array( 'family' => $href ) );
		return sprintf( '<link id="boldgrid-google-fonts" href="%s" rel="stylesheet">', $href );
	}

	public function render_page_fonts() {
		global $post;

		$head_link = '';
		if ( ! empty( $post->post_content ) ) {
			$fonts = $this->parse_fonts( $post->post_content );
			$head_link = $this->create_font_url( $fonts );
		}

		if ( $head_link ) {
			echo $head_link;
		}

		return $head_link;
	}

	public function thememod_class_name( $theme_mod ) {
		$class_name = false;

		switch( $theme_mod ) {
			case 'alternate_headings_font_family':
				$class_name = 'bg-font-family-alt';
				break;
			case 'body_font_family':
				$class_name = 'bg-font-family-body';
				break;
			case 'headings_font_family':
				$class_name = 'bg-font-family-heading';
				break;
			case 'menu_font_family':
				$class_name = 'bg-font-family-menu';
				break;
		}

		return $class_name;
	}

	public function get_theme_fonts() {
		global $boldgrid_theme_framework;

		$theme_mods = array(
			'body_font_family',
			'alternate_headings_font_family',
			'headings_font_family',
			//'menu_font_family'
		);

		$theme_fonts = array();
		if ( $boldgrid_theme_framework ) {

			$configs = $boldgrid_theme_framework->get_configs();
			$defaults = ! empty( $configs['customizer-options']['typography']['defaults'] ) ?
				$configs['customizer-options']['typography']['defaults'] : null;

			foreach ( $defaults as $key => $default ) {
				if ( false !== array_search( $key, $theme_mods, true ) ) {
					$class_name = $this->thememod_class_name( $key );
					if ( $class_name ) {
						$theme_fonts[ $class_name ] = $default;
					}
				}
			}
		}

		$theme_fonts = array_unique ( $theme_fonts );

		return $theme_fonts;
	}
}