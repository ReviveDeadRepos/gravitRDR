(function (_) {

    /**
     * Action creating a new document
     * @class GNewAction
     * @extends GAction
     * @constructor
     */
    function GNewAction() {
    };
    IFObject.inherit(GNewAction, GAction);

    GNewAction.ID = 'file.new';
    GNewAction.TITLE = new IFLocale.Key(GNewAction, "title");

    /**
     * @override
     */
    GNewAction.prototype.getId = function () {
        return GNewAction.ID;
    };

    /**
     * @override
     */
    GNewAction.prototype.getTitle = function () {
        return GNewAction.TITLE;
    };

    /**
     * @override
     */
    GNewAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_FILE;
    };

    /**
     * @override
     */
    GNewAction.prototype.getGroup = function () {
        return "file";
    };

    /**
     * @override
     */
    GNewAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'N'];
    };

    /**
     * @override
     */
    GNewAction.prototype.execute = function () {
        gApp.createNewDocument();
    };

    /** @override */
    GNewAction.prototype.toString = function () {
        return "[Object GNewAction]";
    };

    _.GNewAction = GNewAction;
})(this);