(function (_) {

    /**
     * Action for fitting the current page into the current view
     * @class GFitCurrentPageAction
     * @extends GAction
     * @constructor
     */
    function GFitCurrentPageAction() {
    };
    IFObject.inherit(GFitCurrentPageAction, GAction);

    GFitCurrentPageAction.ID = 'view.zoom.fit-current-page';
    GFitCurrentPageAction.TITLE = new IFLocale.Key(GFitCurrentPageAction, "title");

    /**
     * @override
     */
    GFitCurrentPageAction.prototype.getId = function () {
        return GFitCurrentPageAction.ID;
    };

    /**
     * @override
     */
    GFitCurrentPageAction.prototype.getTitle = function () {
        return GFitCurrentPageAction.TITLE;
    };

    /**
     * @override
     */
    GFitCurrentPageAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    GFitCurrentPageAction.prototype.getGroup = function () {
        return "zoom";
    };

    /**
     * @override
     */
    GFitCurrentPageAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, IFKey.Constant.SHIFT, 'W'];
    };

    /**
     * @override
     */
    GFitCurrentPageAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        var currentPage = document ? document.getScene().getActivePage() : null;

        return (currentPage && currentPage.getPaintBBox() && !currentPage.getPaintBBox().isEmpty());
    };

    /**
     * @override
     */
    GFitCurrentPageAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        var currentPage = document.getScene().getActivePage();
        document.getActiveWindow().getView().zoomAll(currentPage.getPaintBBox(), false);
    };

    /** @override */
    GFitCurrentPageAction.prototype.toString = function () {
        return "[Object GFitCurrentPageAction]";
    };

    _.GFitCurrentPageAction = GFitCurrentPageAction;
})(this);