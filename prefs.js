const { GObject, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = imports.misc.extensionUtils.getCurrentExtension();


function init() {
	ExtensionUtils.initTranslations();
}


function buildPrefsWidget() {
	let widget = new MyPrefsWidget();

	// Workaround for older shell versions (pre 40)
	if (widget.show_all)
		widget.show_all();

	return widget;
}


const MyPrefsWidget = new GObject.Class({
	Name: 'show-desktop-applet-prefs.Widget',
	GTypeName: 'show-desktop-applet-prefs_Widget',
	Extends: Gtk.ScrolledWindow,

	_init: function (params) {
		const Settings = ExtensionUtils.getSettings();
		this.parent(params);

		let builder = new Gtk.Builder();
		builder.set_translation_domain(Me.metadata['gettext-domain']);
		builder.add_from_file(Me.path + '/prefs.ui');

		let currentPosition = Settings.get_enum('button-position');
		let isHotkeyEnabled = Settings.get_boolean('enable-hotkey');

		let comboBox = builder.get_object('panelButtonPosition_combobox');
		let enableSwitch = builder.get_object('useHotkey_switch');

		comboBox.set_active(currentPosition);
		enableSwitch.set_active(isHotkeyEnabled);

		comboBox.connect('changed', (w) => {
			let value = w.get_active();
			Settings.set_enum('button-position', value);
		});

		enableSwitch.connect('state-set', (w) => {
			let value = w.get_active();
			Settings.set_boolean('enable-hotkey', value);
		});

		if (this.set_child) {
			this.set_child(builder.get_object('main_prefs'));
		} else if (this.add) {
			// Workaround for older shell versions (pre 40)
			this.add(builder.get_object('main_prefs'));
		} else {
			log('\n ### Can not show extension settings');
		}
	}

});
