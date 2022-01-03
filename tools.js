const { Gio } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();


function getSettings() {
	let GioSSS = Gio.SettingsSchemaSource;

	let schemaSource = GioSSS.new_from_directory(
		Me.dir.get_child("schemas").get_path(),
		GioSSS.get_default(),
		false
	);

	let schemaObj = schemaSource.lookup(Me.metadata['settings-schema'], true);

	if (!schemaObj) {
		throw new Error('Cannot find schemas');
	}

	return new Gio.Settings({ settings_schema: schemaObj });
}


function getExternalSettings(schemaStr) {
	return new Gio.Settings({ schema: schemaStr });
}
