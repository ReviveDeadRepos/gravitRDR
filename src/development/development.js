(function (_) {
    /**
     * GravitRDR Development Module
     * @class GDevelopmentModule
     * @constructor
     * @extends GModule
     */
    function GDevelopmentModule() {
    }
    IFObject.inherit(GDevelopmentModule, GModule);

    /** @override */
    GDevelopmentModule.prototype.init = function () {
        var testActions = [];
        for (var i = 0; i < _.gDevelopment.tests.length; ++i) {
            testActions.push(new TestAction(_.gDevelopment.tests[i]));
        }

        // Register test actions
        gravitrdr.actions = gravitrdr.actions.concat(testActions);
    };

    /** @override */
    GDevelopmentModule.prototype.toString = function () {
        return '[Module GravitRDR Development]';
    };

    gravitrdr.modules.push(new GDevelopmentModule());
})(this);
