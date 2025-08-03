(function (_) {

    /**
     * Document properties panel
     * @class GDocumentProperties
     * @extends GProperties
     * @constructor
     */
    function GDocumentProperties() {
    };
    IFObject.inherit(GDocumentProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GDocumentProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GDocumentProperties.prototype._document = null;

    /** @override */
    GDocumentProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Document';
    };

    /** @override */
    GDocumentProperties.prototype.init = function (panel, controls) {
        this._panel = panel;

        $('<button></button>')
            // TODO : I18N
            .attr('title', 'More Settings')
            .on('click', function (evt) {
                var $target = $(evt.target).closest('button');
                $target.toggleClass('g-active', !$target.hasClass('g-active'));
                this._showMore($target.hasClass('g-active'));
            }.bind(this))
            .append($('<span></span>')
                .addClass('fa fa-cog'))
            .appendTo(controls);

        var _createInput = function (property) {
            var self = this;
            if (property === 'unit') {
                return $('<select></select>')
                    .attr('data-property', property)
                    //.css('width', '100%')
                    .gUnit()
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === 'unitSnap') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .append($('<option></option>')
                        .attr('value', IFScene.UnitSnap.None)
                        // TODO : I18N
                        .text('None'))
                    .append($('<option></option>')
                        .attr('value', IFScene.UnitSnap.Full)
                        // TODO : I18N
                        .text('Full'))
                    .append($('<option></option>')
                        .attr('value', IFScene.UnitSnap.Half)
                        // TODO : I18N
                        .text('Half'))
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === 'gridSizeX' || property === 'gridSizeY') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '3em')
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 1) {
                            self._assignProperty(property, value < 0 ? 0 : value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'gridActive') {
                return $('<div></div>')
                    .css('width', '4em')
                    .addClass('g-switch')
                    .append($('<label></label>')
                        .append($('<input>')
                            .attr('type', 'checkbox')
                            .attr('data-property', property)
                            .on('change', function () {
                                self._assignProperty(property, $(this).is(':checked'));
                            }))
                        .append($('<span></span>')
                            .addClass('switch')
                            .attr({
                                // TODO : I18N
                                'data-on': 'On',
                                'data-off': 'Off'
                            })));
            } else if (property === 'crDistSmall' || property === 'crDistBig') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '3em')
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 1) {
                            self._assignProperty(property, value < 0 ? 0 : value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'crConstraint') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '3em')
                    .on('change', function () {
                        var angle = IFLength.parseEquationValue($(this).val());
                        if (angle !== null) {
                            angle = ifMath.normalizeAngleRadians(ifMath.toRadians(angle));
                            self._assignProperty(property, angle);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'snapDist' || property === 'pickDist') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '3em')
                    .on('change', function () {
                        var value = parseInt($(this).val());
                        if (!isNaN(value)) {
                            self._assignProperty(property, value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'clspace') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .append($('<option></option>')
                        .attr('value', IFColorSpace.RGB)
                        .text('RGB'))
                    .append($('<option></option>')
                        .attr('value', IFColorSpace.CMYK)
                        .text('CMYK'))
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === 'pathImage' || property === 'pathFont' || property === 'pathExport') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '100%')
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        $('<table></table>')
            .addClass('g-form')
            .css('margin', '0px auto')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Unit/Snap:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('unit'))
                    .append(_createInput('unitSnap'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Grid:'))
                .append($('<td></td>')
                    .append(_createInput('gridSizeX')
                        // TODO : I18N
                        .attr('title', 'Horizontal Grid-Size'))
                    .append(_createInput('gridSizeY')
                        // TODO : I18N
                        .attr('title', 'Vertical Grid-Size')))
                .append($('<td></td>')
                    .attr('colspan', '2')
                    .css('text-align', 'right')
                    .append(_createInput('gridActive'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', 4)
                    .append($('<h1></h1>')
                        .addClass('g-divider')
                        // TODO : I18N
                        .text('Defaults'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Cursor:'))
                .append($('<td></td>')
                    .append(_createInput('crDistSmall')
                        // TODO : I18N
                        .attr('title', 'Small Distance when moving via Arrow-Keys'))
                    .append(_createInput('crDistBig')
                        // TODO : I18N
                        .attr('title', 'Large Distance when moving via Arrow-Keys')))
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('°'))
                .append($('<td></td>')
                    .append(_createInput('crConstraint')
                        // TODO : I18N
                        .attr('title', 'Constraints when moving via Shift in Degrees'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .html('<span class="fa fa-arrows"></span> / <span class="fa fa-magnet"></span>'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('pickDist')
                        // TODO : I18N
                        .attr('title', 'Pick Distance in Pixels'))
                    .append(_createInput('snapDist')
                        // TODO : I18N
                        .attr('title', 'Snap Distance'))))
            .append($('<tr></tr>')
                .attr('data-more', 'yes')
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<h1></h1>')
                        .addClass('g-divider')
                        // TODO : I18N
                        .text('Color'))))
            .append($('<tr></tr>')
                .attr('data-more', 'yes')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Color:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('clspace')
                        // TODO : I18N
                        .attr('title', 'Default Colorspace of document'))))
            .append($('<tr></tr>')
                .attr('data-more', 'yes')
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<h1></h1>')
                        .addClass('g-divider')
                        // TODO : I18N
                        .text('Pathes'))))
            .append($('<tr></tr>')
                .attr('data-more', 'yes')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Images'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('pathImage')
                        // TODO : I18N
                        .attr('title', 'Path for imported image assets'))))
            .append($('<tr></tr>')
                .attr('data-more', 'yes')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Fonts'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('pathFont')
                        // TODO : I18N
                        .attr('title', 'Path for imported font assets'))))
            .append($('<tr></tr>')
                .attr('data-more', 'yes')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Export'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('pathExport')
                        // TODO : I18N
                        .attr('title', 'Path for exported assets'))))
            .appendTo(panel);

        this._showMore(false);
    };

    /** @override */
    GDocumentProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        if (elements.length === 1 && elements[0] instanceof IFScene) {
            this._document = document;
            this._document.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._updateProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GDocumentProperties.prototype._afterPropertiesChange = function (event) {
        if (event.node === this._document.getScene()) {
            this._updateProperties();
        }
    };

    /**
     * @private
     */
    GDocumentProperties.prototype._updateProperties = function () {
        var scene = this._document.getScene();
        this._panel.find('select[data-property="unit"]').val(scene.getProperty('unit'));
        this._panel.find('select[data-property="unitSnap"]').val(scene.getProperty('unitSnap'));
        this._panel.find('input[data-property="gridSizeX"]').val(scene.pointToString(scene.getProperty('gridSizeX')));
        this._panel.find('input[data-property="gridSizeY"]').val(scene.pointToString(scene.getProperty('gridSizeY')));
        this._panel.find('input[data-property="gridActive"]').prop('checked', scene.getProperty('gridActive'));
        this._panel.find('input[data-property="crDistSmall"]').val(scene.pointToString(scene.getProperty('crDistSmall')));
        this._panel.find('input[data-property="crDistBig"]').val(scene.pointToString(scene.getProperty('crDistBig')));
        this._panel.find('input[data-property="crConstraint"]').val(
            ifUtil.formatNumber(ifMath.toDegrees(scene.getProperty('crConstraint')), 2));
        this._panel.find('input[data-property="snapDist"]').val(scene.pointToString(scene.getProperty('snapDist')));
        this._panel.find('input[data-property="pickDist"]').val(scene.pointToString(scene.getProperty('pickDist')));
        this._panel.find('select[data-property="clspace"]').val(scene.getProperty('clspace'));
        this._panel.find('input[data-property="pathImage"]').val(scene.getProperty('pathImage'));
        this._panel.find('input[data-property="pathFont"]').val(scene.getProperty('pathFont'));
        this._panel.find('input[data-property="pathExport"]').val(scene.getProperty('pathExport'));
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GDocumentProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GDocumentProperties.prototype._assignProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            this._document.getScene().setProperties(properties, values);
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Document Properties');
        }
    };

    /** @private */
    GDocumentProperties.prototype._showMore = function (more) {
        this._panel.find('[data-more]').each(function (index, element) {
            $(element).css('display', more ? '' : 'none');
        });
    };

    /** @override */
    GDocumentProperties.prototype.toString = function () {
        return "[Object GDocumentProperties]";
    };

    _.GDocumentProperties = GDocumentProperties;
})(this);