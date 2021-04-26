const {GObject, Gtk} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Tools = Me.imports.tools;
const Settings = Tools.getSettings();
const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

function init () {
    ExtensionUtils.initTranslations();
}

function buildPrefsWidget () {
	
	let widget = new MyPrefsWidget();

	// Workaround for older shell versions (pre 40)
	if (widget.show_all)
		widget.show_all();

	return widget;
}

const MyPrefsWidget = new GObject.Class({

	Name : "show-desktop-button-prefs.Widget",
	GTypeName : "show-desktop-button-prefs_Widget",
	Extends : Gtk.ScrolledWindow,
	
	_init : function (params) {
	
		this.parent(params);
		
		let builder = new Gtk.Builder();
		builder.set_translation_domain(Me.metadata['gettext-domain']);
		builder.add_from_file(Me.path + '/prefs.ui');
		
		let currentPosition = Settings.get_enum('panel-position');
		let comboBox = builder.get_object("panelButtonPosition_combobox");
		
		comboBox.set_active(currentPosition);
		
		comboBox.connect("changed", (w) => {
		    let value = w.get_active();
		    Settings.set_enum('panel-position', value);
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
