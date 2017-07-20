function isEnabled(local) {
    var defaults = NSUserDefaults.standardUserDefaults();
    return (local || defaults.boolForKey("enableAutoSaveAndVersions")) &&
        (defaults.objectForKey("com.designplugins.autoCleanHistory") != null ? defaults.boolForKey("com.designplugins.autoCleanHistory") : true);
}

function toggleAutoCleanHistory() {
    var defaults = NSUserDefaults.standardUserDefaults();
    var enabled = !isEnabled(true);
    defaults.setBool_forKey(enabled, "com.designplugins.autoCleanHistory");
    showStatusMessage(enabled ? "Enabled Auto Clean History" : "Disabled Auto Clean History");
}

function onDocumentClose(context) {
    if (!isEnabled()) return;
    var url = context.actionContext.document.fileURL();
    if (!url) return;
    NSFileVersion.removeOtherVersionsOfItemAtURL_error(url, 0);
}

function getAllDocumentPaths() {
    var task = NSTask.alloc().init();
    task.launchPath = "/usr/bin/mdfind";
    task.arguments = ["-0", "kMDItemFSName='*.sketch'", "2>/dev/null"];
    task.standardOutput = NSPipe.pipe();
    task.launch();
    task.waitUntilExit();
    var output = NSString.alloc().initWithData_encoding(task.standardOutput().fileHandleForReading().readDataToEndOfFile(), NSUTF8StringEncoding);
    var paths = output.componentsSeparatedByString("\0");
    return paths;
}

function humanFileSize(bytes) {
    var thresh = 1000;
    if (bytes == 0) return "zero bytes";
    if (Math.abs(bytes) < 2) return bytes + " byte";
    if (Math.abs(bytes) < thresh) return bytes + " bytes";
    var units = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
}

function showStatusMessage(msg) {
    try {
        NSApplication.sharedApplication().orderedDocuments().firstObject().showMessage(msg);
    } catch(e) {}
}

function hideStatusMessage(msg) {
    try {
        NSApplication.sharedApplication().orderedDocuments().firstObject().hideMessage();
    } catch(e) {}
}

function deleteOldFileVersions() {
    showStatusMessage("Clearing revision history…");
    var fileManager = NSFileManager.defaultManager();
    var paths = getAllDocumentPaths();
    for (var i = 0, n = paths.length; i < n; i++) {
        if (!(i % Math.round(n / 100 + 1)) || i == n - 1) {
            showStatusMessage("Clearing revision history… " + Math.round(100 * (i + 1) / n) + "%");
        }
        var path = paths[i];
        if (!path || !fileManager.fileExistsAtPath(path)) continue;
        NSFileVersion.removeOtherVersionsOfItemAtURL_error(NSURL.fileURLWithPath(path), 0);
    }
    hideStatusMessage();
    return true;
}

function forceDeleteFileVersions() {
    var task = NSTask.alloc().init();
    task.launchPath = "/usr/bin/osascript";
    task.arguments = ["-e", "do shell script \"echo $(sudo du -sk /.DocumentRevisions-V100 2>/dev/null | cut -f1)000\" with administrator privileges"];
    task.standardOutput = NSPipe.pipe();
    task.launch();
    task.waitUntilExit();
    var output = NSString.alloc().initWithData_encoding(task.standardOutput().fileHandleForReading().readDataToEndOfFile(), NSUTF8StringEncoding);
    var totalSize = output.doubleValue();
    if (task.terminationStatus() != 0) return false;
    var alert = NSAlert.alloc().init();
    alert.messageText = "Are you sure you want to clear entire revision history?";
    alert.informativeText = "It is not recommended to use this method as it destroys all unsaved document versions for all applications. You may need to restart your computer to continue using Versions and Auto Save.\n\nTotal size of document versions is " + humanFileSize(totalSize) + ".";
    var okButton = alert.addButtonWithTitle("Force Clear");
    var cancelButton = alert.addButtonWithTitle("Cancel");
    okButton.setKeyEquivalent("\b");
    cancelButton.setKeyEquivalent("\r");
    var result = alert.runModal();
    if (result == NSAlertSecondButtonReturn) return false;
    var task = NSTask.alloc().init();
    task.launchPath = "/usr/bin/osascript";
    task.arguments = ["-e", "do shell script \"rm -rf /.DocumentRevisions-V100\" with administrator privileges"];
    task.launch();
    task.waitUntilExit();
    if (task.terminationStatus() != 0) return false;
    return true;
}

function clearRevisionHistory(context) {
    var alert = NSAlert.alloc().init();
    alert.messageText = "Are you sure you want to clear revision history?";
    alert.informativeText = "All unsaved versions of Sketch documents not backed up by Time Machine will be permanently deleted. You can’t undo this action.";
    alert.addButtonWithTitle("Clear");
    alert.addButtonWithTitle("Cancel");
    alert.addButtonWithTitle("Force Clear…");
    var result = alert.runModal();
    if (result == NSAlertSecondButtonReturn) return;
    var fileManager = NSFileManager.defaultManager();
    var paths = getAllDocumentPaths();
    var freeSpaceBefore = fileManager.attributesOfFileSystemForPath_error("/", 0).objectForKey(NSFileSystemFreeSize).doubleValue();
    if (result == NSAlertThirdButtonReturn) {
        if (!forceDeleteFileVersions()) return;
    } else {
        if (!deleteOldFileVersions()) return;
    }
    var freeSpaceAfter = NSFileManager.defaultManager().attributesOfFileSystemForPath_error("/", 0).objectForKey(NSFileSystemFreeSize).doubleValue();
    var savedSpace = Math.max(freeSpaceAfter - freeSpaceBefore, 0);
    var alert = NSAlert.alloc().init();
    alert.messageText = "Successfully deleted old versions.";
    alert.informativeText = "Recovered " + humanFileSize(savedSpace) + " of free space on your hard drive.";
    alert.addButtonWithTitle("OK");
    alert.runModal();
}
