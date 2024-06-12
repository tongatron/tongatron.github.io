<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, WordPress Language, and ABSPATH. You can find more information
 * by visiting {@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'giobindi_wp1');

/** MySQL database username */
define('DB_USER', 'giobindi_wp1');

/** MySQL database password */
define('DB_PASSWORD', 'O#6Ks^e(*939~]6');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'svgqJmRbvWI9eChwzY6sljy7cuggSxNN9jsDvJkBm5ZnNk63y6BKWkMJSaOGIvun');
define('SECURE_AUTH_KEY',  'eUeF3ZjDkZwFzZlKaToZoea4JweBZC5CgzZwTXmk8YCIJyJKopSrOy178R7PrrYH');
define('LOGGED_IN_KEY',    'iHZPoZnqjA0BrX0DapFsftRS0DZjCWsdPNxThEA5AYIB7m1OcLmYo5kUXHxTuimX');
define('NONCE_KEY',        'DDtB0513t6Da7xxKH8P2OLJsDo8OFQ4GDP2SJKo5VAKAJBvtREHOWwhpUuLIO2tk');
define('AUTH_SALT',        'uG5ygDvex9oId2itseSmcx9ALiHUcUh3g8cuy7S3geGM3PkKkfVIR0Tua1cYwr0Y');
define('SECURE_AUTH_SALT', 'zuwopdBK8J4oh5KyT9sXqtDtb7Yq7XszwhQi44DGrlX1Qn365icZsUKup0zcP2Kc');
define('LOGGED_IN_SALT',   'mpzDz9TU2gsLccULXVlVKBwlpQv5Pe8X9yY3fuiH8SAGYY836GQzbGwHt46ROmqb');
define('NONCE_SALT',       'NmhFFDKEueHxhgsPnN0ge3kLmprXDiGZEpqQmJc82WJX5KEr02oaCyJxDoVvta9M');

/**
 * Other customizations.
 */
define('FS_METHOD','direct');define('FS_CHMOD_DIR',0755);define('FS_CHMOD_FILE',0644);
define('WP_TEMP_DIR',dirname(__FILE__).'/wp-content/uploads');

/**
 * Turn off automatic updates since these are managed upstream.
 */
define('AUTOMATIC_UPDATER_DISABLED', true);


/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
