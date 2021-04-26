const { St, Shell, Atk } = imports.gi;
const Main = imports.ui.main;
const Util = imports.misc.util;
const Meta = imports.gi.Meta;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Tools = Me.imports.tools;
const Settings = Tools.getSettings();

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
		icon_name: 'user-home-symbolic',
		style_class: 'system-status-icon',
	});

	panelButton.add_child(icon);

	panelButton.connect('button-press-event', toggleDesktop);

	return panelButton;
}

function addButton() {

	let role = `${ExtensionName} Indicator`;
	let positions = ['left', 'center', 'right'];

	Main.panel.addToStatusArea(role, getPanelButton(), 1, positions[Settings.get_enum('panel-position')]);
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
}

function disable() {
	storedWindows = null;
	removeButton();
}
