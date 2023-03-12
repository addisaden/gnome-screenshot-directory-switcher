/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* usefull shell commands:
 * 
 * Debug:
 * journalctl -f -o cat /usr/bin/gnome-shell
 * 
 * get gnome-screenshot directory:
 * gsettings get "org.gnome.gnome-screenshot" "auto-save-directory"
 * 
 * documentation
 * https://docs.gtk.org/glib/func.spawn_command_line_async.html
 */

/* exported init */

const GETTEXT_DOMAIN = 'gnome-screenshot-directory-switcher';

const { GObject, St, GLib } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Gnome-Screenshot Directory Switcher'));

        this.add_child(new St.Icon({
            icon_name: 'camera-web-skinny-symbolic',
            style_class: 'system-status-icon',
        }));

        let userhome = GLib.get_home_dir();

        let workdir = userhome + "/Bilder/Bildschirmfotos/work";
        let homedir = userhome + "/Bilder/Bildschirmfotos/home";

        let item_work = new PopupMenu.PopupMenuItem(_('Work'));
        let item_home = new PopupMenu.PopupMenuItem(_('Home'));

        item_work.connect('activate', () => {
            this._take_screenshot(workdir);
            // if (res == true) {
            //     item_work.setOrnament(PopupMenu.Ornament.CHECK);
            //     item_home.setOrnament(PopupMenu.Ornament.NONE);
            // }
        });

        item_home.connect('activate', () => {
            this._take_screenshot(homedir);
            // if (res == true) {
            //     item_home.setOrnament(PopupMenu.Ornament.CHECK);
            //     item_work.setOrnament(PopupMenu.Ornament.NONE);
            // }
        });

        this.menu.addMenuItem(item_work);
        this.menu.addMenuItem(item_home);
    }

    _take_screenshot(dirpath) {
        // var command = 'gsettings set "org.gnome.gnome-screenshot" "auto-save-directory" "file://'+ dirpath + "'\""
        // let [res, out, err, status] = GLib.spawn_command_line_sync(command);
        // var command2 = 'gsettings set "org.gnome.gnome-screenshot" "last-save-directory" "file://'+ dirpath + "'\""
        // let [res2, out2, err2, status2] = GLib.spawn_command_line_sync(command2);
        
        let curd = new Date();
        let curdstr = curd.getFullYear() + "-" + (curd.getMonth()+1) + "-" + curd.getDate() + "_" + curd.getHours() + "-" + curd.getMinutes() + "-" + curd.getSeconds();
        let command = "gnome-screenshot -a -f \"" + dirpath + "/screenshot_" + curdstr + ".png\"";
        GLib.spawn_command_line_async(command);
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
