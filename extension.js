const { St, Shell, Atk } = imports.gi;
const Main = imports.ui.main;
const Util = imports.misc.util;
const Meta = imports.gi.Meta;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Tools = Me.imports.tools;
const Settings = Tools.getSettings();
const extSettings = Tools.getExternalSettings('org.gnome.desktop.wm.keybindings');

const ExtensionName = Me.metadata.name;

let panelButton;
let storedWindows = [];


function toggleDesktop() {

	let workspace = global.workspace_manager.get_active_workspace();
	let windows = workspace.list_windows();

	log("\n### " + ExtensionName + " debugging START ###");

	let tmpStoredWindows = [];
	// Try to minimize all windows
	for (let i = 0; i < windows.length; ++i) {
		if (!windowShouldBeIgnored(windows[i])) {
			windows[i].minimize();
			tmpStoredWindows.push(windows[i])
		}
	}

	if (tmpStoredWindows.length > 0) {
		storedWindows = tmpStoredWindows;
	} else {
		// If nothing were minimized (desktop is alredy shown)
		// try to restore previously minimized
		for (let i = 0; i < storedWindows.length; i++) {
			if (storedWindows[i] && storedWindows[i].located_on_workspace(workspace))
				storedWindows[i].unminimize();
		}
		storedWindows = [];
	}

	if (Main.overview.visible) {
		Main.overview.hide();
	}
}


function windowShouldBeIgnored(window) {
	if (!window)
		return true;

	let wm_class = window.wm_class.toLowerCase();
	if (window.wm_class == null) {
		wm_class = 'null';
	}

	let window_type = window.window_type;
	if (window.window_type == null) {
		window_type = 'null';
	}

	let title = window.title;
	if (window.title == null) {
		title = 'null';
	}

	log("i: " +
		"\ttitle: " + title +
		"\twindow_type: " + window_type +
		"\twm_class: " + wm_class);

	if (window.minimized ||
		window_type == Meta.WindowType.DESKTOP ||
		window_type == Meta.WindowType.DOCK ||
		title.startsWith('DING') ||
		wm_class.endsWith('notejot') ||
		wm_class == 'conky' ||
		(title.startsWith('@!') && title.endsWith('BDH'))) {

		return true;
	}

	return false;
}

function getPanelButton() {

	panelButton = new PanelMenu.Button(0.0, `${ExtensionName}`, false);

	let icon = new St.Icon({
		icon_name: 'computer-symbolic',
		style_class: 'system-status-icon',
	});

	panelButton.add_child(icon);

	panelButton.connect('button-press-event', toggleDesktop);

	return panelButton;
}

function addButton() {

	let role = `${ExtensionName} Indicator`;
	let index = Settings.get_enum('panel-position');
	let positions = ['left', 'left', 'center', 'right', 'right'];
	let modifiers = [0, 1, 0, 1, -1];

	Main.panel.addToStatusArea(role, getPanelButton(), modifiers[index], positions[index]);
}

function removeButton() {
	panelButton.destroy();
	panelButton = null;
}

function init() {
	Settings.connect('changed', (s) => {
		removeButton();
		addButton();
	});
}

function enable() {
	storedWindows = [];
	addButton();

	let mode = Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW | Shell.ActionMode.POPUP;
	let flag = Meta.KeyBindingFlags.IGNORE_AUTOREPEAT;

	extSettings.set_strv('show-desktop', []);
	Main.wm.addKeybinding('hotkey', Settings, flag, mode, toggleDesktop);
}

function disable() {
	Main.wm.removeKeybinding('hotkey');
	extSettings.reset('show-desktop');

	storedWindows = null;
	removeButton();
}
