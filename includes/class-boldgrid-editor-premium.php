<?php
/**
 * File: Premium.php
 *
 * Print out serveral notices.
 *
 * @since      1.0.0
 * @package    BoldGrid
 * @subpackage PPBP
 * @author     BoldGrid <support@boldgrid.com>
 * @link       https://boldgrid.com
 */

/**
 * Class: Premium
 *
 * Print out serveral notices.
 *
 * @since 1.0.0
 */
class Boldgrid_Editor_Premium {

	/**
	 * Add Premium Hooks.
	 *
	 * @since 1.0.0
	 */
	public function init() {
		// "Upgrade to premium" notices. Notice class instantiated to trigger required hooks.
		$notice_class = '\Boldgrid\Library\Library\Notice';
		if ( class_exists( $notice_class ) ) {
			new $notice_class( 'Static Notice' );
			add_action( 'admin_notices', [ $this, 'admin_notice_setup' ] );
		}
	}

	/**
	 * Get the plugins premium url.
	 *
	 * @since 1.10.0
	 *
	 * @return string URL.
	 */
	public function get_premium_url() {
		$url = 'https://www.boldgrid.com/central/plugins';
		if ( class_exists( '\Boldgrid\Library\Library\Plugin\Plugin' ) ) {
			$premium_plugin = new \Boldgrid\Library\Library\Plugin\Plugin( 'post-and-page-builder-premium' );
			$url = $premium_plugin->getDownloadUrl();
		}

		return $url;
	}

	/**
	 * Display "setup" admin notices.
	 *
	 * This method is currently used to display admin notices to help guide the
	 * user to getting a premium key and getting / activating the premium extension.
	 *
	 * @since 1.0.0
	 */
	public function admin_notice_setup() {
		$config = Boldgrid_Editor_Service::get( 'config' );

		// If the premium plugin is installed and all is good, abort!
		if ( $config['premium']['is_premium_done'] ) {
			return;
		}

		// Check user role.
		if ( ! current_user_can( 'update_plugins' ) ) {
			return;
		}

		$notices = array(
			array(
				'id'      => 'BGPPB_activate_premium',
				'show'    => $config['premium']['is_premium'] && $config['premium']['is_premium_installed'],
				'message' => '<p>' . sprintf(
					// translators: 1: URL address for the wp-admin plugins page.
					__(
						'You have a <strong>Premium BoldGrid Connect Key</strong> and <strong>Post and Page Builder Premium</strong> installed. Please go to your <a href="%1$s">plugins page</a> and activate your premium extension!',
						'boldgrid-editor'
					),
					admin_url( 'plugins.php' )
				) . '</p>',
			),
			array(
				'id'      => 'BGPPB_upgrade_premium',
				'show'    => ! $config['premium']['is_premium'] && $config['premium']['is_premium_active'],
				'message' => '<p>' . sprintf(
					// translators: 1: URL address for the upgrade page.
					__( 'Thank you for activating the <strong>Post & Page Builder Premium</strong>! Before you can begin using all of the premium features, you must <a href="%2$s">add your premium key</a>. If you are using an Official BoldGrid Host, contact them or login to their management system to retrieve your Premium key. Otherwise, please visit <a href="%1$s" target="_blank">BoldGrid Central</a> to upgrade.', 'boldgrid-editor' ),
					admin_url( 'options-general.php?page=boldgrid-connect.php' ),
					$config['urls']['premium_key'] . '?source=ppbp-installed'
				) . '</p>',
			),
			array(
				'id'      => 'BGPPB_download_premium',
				'show'    => $config['premium']['is_premium'] && ! $config['premium']['is_premium_installed'],
				'message' => '<p>' . sprintf(
					// translators: 1: URL address for BoldGrid Central.
					__(
						'Hello there! We see that you have a <strong>Premium BoldGrid Connect Key</strong> and you have the <strong>Post & Page Builder</strong> activated! Be sure to download the <a href="%1$s">Post and Page Builder Premium Extension</a> to gain access to more features!',
						'boldgrid-editor'
					),
					$this->get_premium_url()
				) . '</p>',
			),
		);

		foreach ( $notices as $notice ) {
			if ( $notice['show'] ) {
				\Boldgrid\Library\Library\Notice::show( $notice['message'], $notice['id'] );
				break;
			}
		}
	}
}
