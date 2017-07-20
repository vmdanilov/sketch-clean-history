# Clean History for Sketch

This plugin helps you to keep your document revision history clean. It fixes *Auto Save* in Sketch, so you will never loose your work nor free space, and at the same time you will be able to enjoy all the benefits of Versions.

If you have *Auto Save* enabled, every time you save or open a document and every hour while you’re working on it, macOS automatically records its changes to Versions database. These versions are nice to have but considering the size of design documents your startup disk is going to be full of them pretty soon.

With Clean History plugin, you can clear revision history for all Sketch documents on your Mac. This can potentially recover gigabytes of free space.

In addition, every time you close the document, its old versions will be automatically discarded. This way you still have access to old versions while working on the document and automatically save space when finished. You can always disable this behavior and explicitly clear revision history when needed.

Previous versions will still be stored in Time Machine if enabled. Time Machine treats storage space with more care. It is also highly recommended to set up an external backup drive. Otherwise backups tend to occupy all available free space until disk is 80-90% full.

*If you want to save even more space, consider compressing images with [Optimage](http://getoptimage.com).*

## Installation

Requires [Sketch](https://sketchapp.com/) 3.8+.

1. Download [Clean History for Sketch](https://github.com/vmdanilov/sketch-clean-history/releases/latest) and unzip it.
2. Double click *Clean History.sketchplugin* to install the plugin.

The plugin will be installed to the default Sketch plugins folder and will appear in *Plugins* tab in *Preferences*.

## Usage

The plugin commands are available through *Plugins > Clean History* menu in Sketch.

- *Clear Revision History* – safely deletes old versions of all Sketch documents on your Mac. It will show how much free space has been recovered. There is also an option to force clear all document versions for all apps, use it only as a last resort.
- *Auto Clean History* – toggles auto removal of old versions for closed documents (enabled by default).

## References

1. [“How Sketch took over 200GB of our MacBooks”](https://medium.com/@thomasdegry/how-sketch-took-over-200gb-of-our-macbooks-cb7dd10c8163) by Thomas Degry.
2. [“How to recover 50 GB or even more by deleting Sketch caches files”](https://medium.com/sketch-app-sources/how-to-recover-50-go-or-even-more-by-deleting-sketch-caches-files-e5829dba20e1) by Philippe Hong.
3. [“Sketch users! Free up some space!”](https://dribbble.com/shots/2184593-Sketch-users-Free-up-some-space) by Robin Andersen.

**Warning!** The proposed solution in these articles actually destroys all local document versions for all apps on your Mac. The `/.DocumentRevisions-V100` folder is not some hidden Sketch cache but the system protected Versions database. That very same command is also notorious for [many disasters](https://www.google.com/search?q=sudo+rm).

## License

The MIT License.