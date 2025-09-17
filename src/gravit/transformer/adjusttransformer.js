(function (_) {

    /**
     * Transform transform panel
     * @class GAdjustTransformer
     * @extends GTransformer
     * @constructor
     */
    function GAdjustTransformer() {
        this._elements = [];
        this._savedValues = {
            'Move': [0, 0],
            'Scale': [100, 100],
            'Rotate': [0],
            'Skew': [0, 0],
            'Reflect': [0]
        };
    };
    IFObject.inherit(GAdjustTransformer, GTransformer);

    GAdjustTransformer._TransformMode = {
        Move: {
            label1: {
                prefix: 'X'
            },
            label2: {
                prefix: 'Y'
            },
            pivot: false,
            transformFunc: function (val1, val2, scene) {
                var tx = scene.stringToPoint(val1) || 0;
                var ty = scene.stringToPoint(val2) || 0;

                if (tx !== 0 || ty !== 0) {
                    return function (step, element, origin) {
                        element.transform(new IFTransform(1, 0, 0, 1, tx * step, ty * step));
                    }
                }

                return null;
            }
        },
        Scale: {
            label1: {
                prefix: 'W',
                postfix: '%'
            },
            label2: {
                prefix: 'H',
                postfix: '%'
            },
            pivot: true,
            transformFunc: function (val1, val2, scene) {
                var sx = parseFloat(val1) / 100.0 || 1;
                var sy = parseFloat(val2) / 100.0 || 1;

                if (sx !== 1 || sy !== 1) {
                    return function (step, element, origin) {
                        element.transform(new IFTransform()
                            .translated(-origin.getX(), -origin.getY())
                            .scaled(sx + (sx - 1) * (step - 1), sy + (sy - 1) * (step - 1))
                            .translated(origin.getX(), origin.getY()));
                    }
                }
                return null;
            }
        },
        Rotate: {
            label1: {
                prefix: 'Angle',
                postfix: '°'
            },
            pivot: true,
            transformFunc: function (val1, val2, scene) {
                var angle = ifMath.toRadians(parseFloat(val1)) || 0;

                if (angle !== 0) {
                    return function (step, element, origin) {
                        element.transform(new IFTransform()
                            .translated(-origin.getX(), -origin.getY())
                            .rotated(-angle * step)
                            .translated(origin.getX(), origin.getY()));
                    }
                }

                return null;
            }
        },
        Skew: {
            label1: {
                prefix: 'X',
                postfix: '°'
            },
            label2: {
                prefix: 'Y',
                postfix: '°'
            },
            pivot: true,
            transformFunc: function (val1, val2, scene) {
                var sx = ifMath.toRadians(parseFloat(val1)) || 0;
                var sy = ifMath.toRadians(parseFloat(val2)) || 0;

                if ((sx !== 0 || sy !== 0) && (sx > -ifMath.PIHALF && sy > -ifMath.PIHALF && sx < ifMath.PIHALF && sy < ifMath.PIHALF)) {
                    return function (step, element, origin) {
                        element.transform(new IFTransform()
                            .translated(-origin.getX(), -origin.getY())
                            .skewed(sx * step, sy * step)
                            .translated(origin.getX(), origin.getY()));
                    }
                }

                return null;
            }
        },
        Reflect: {
            label1: {
                prefix: 'Axis',
                postfix: '°'
            },
            pivot: true,
            transformFunc: function (val1, val2, scene) {
                var angle = parseFloat(val1) || 0;
                angle = ifMath.toRadians(-angle);
                var cosA = Math.cos(angle);
                var sinA = Math.sin(angle);

                return function (step, element, origin) {
                    if (step % 2) {
                        element.transform(new IFTransform()
                            .translated(-origin.getX(), -origin.getY())
                            .multiplied(new IFTransform(cosA, -sinA, sinA, cosA, 0, 0))
                            .multiplied(new IFTransform(1, 0, 0, -1, 0, 0))
                            .multiplied(new IFTransform(cosA, sinA, -sinA, cosA, 0, 0))
                            .translated(origin.getX(), origin.getY()));
                    }
                }
            }
        }
    };

    /**
     * @type {JQuery}
     * @private
     */
    GAdjustTransformer.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GAdjustTransformer.prototype._document = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GAdjustTransformer.prototype._elements = null;

    /**
     * @type {GAdjustTransformer._TransformMode}
     * @private
     */
    GAdjustTransformer.prototype._transformMode = null;

    /**
     * @type {*}
     * @private
     */
    GAdjustTransformer.prototype._savedValues = null;

    /** @override */
    GAdjustTransformer.prototype.getCategory = function () {
        // TODO : I18N
        return 'Adjust';
    };

    /** @override */
    GAdjustTransformer.prototype.init = function (panel) {
        this._panel = panel;

        panel
            .css('width', '166px')
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '5px'
                })
                .append($('<button></button>')
                    .addClass('g-flat')
                    // TODO : I18N
                    .attr('title', 'Move')
                    .attr('data-mode', 'Move')
                    .append($('<span></span>')
                        .addClass('fa fa-arrows')))
                .append($('<button></button>')
                    .addClass('g-flat')
                    // TODO : I18N
                    .attr('title', 'Scale')
                    .attr('data-mode', 'Scale')
                    .append($('<span></span>')
                        .addClass('fa fa-expand')))
                .append($('<button></button>')
                    .addClass('g-flat')
                    // TODO : I18N
                    .attr('title', 'Rotate')
                    .attr('data-mode', 'Rotate')
                    .append($('<span></span>')
                        .addClass('fa fa-rotate-right')))
                .append($('<button></button>')
                    .addClass('g-flat')
                    // TODO : I18N
                    .attr('title', 'Skew')
                    .attr('data-mode', 'Skew')
                    .append($('<span></span>')
                        .addClass('fa fa-eraser')))
                .append($('<button></button>')
                    .addClass('g-flat')
                    // TODO : I18N
                    .attr('title', 'Reflect')
                    .attr('data-mode', 'Reflect')
                    .append($('<span></span>')
                        .addClass('fa fa-star-half-o')))
                .append($('<button></button>')
                    // TODO : I18N
                    .css('margin-left', '7px')
                    // TODO : I18N
                    .text('Apply')
                    .on('click', this._apply.bind(this))))
            .append($('<label></label>')
                .attr('data-value', '1')
                .css({
                    'position': 'absolute',
                    'left': '5px',
                    'top': '30px'
                })
                .append($('<span></span>')
                    .attr('data-prefix', ''))
                .append($('<input>')
                    .css({
                        'margin-left': '3px',
                        'width': '48px'
                    })
                    .val('0')
                    .on('keyup', function (evt) {
                        if (evt.keyCode == 13) {
                            this._apply();
                        }
                    }.bind(this)))
                .append($('<span></span>')
                    .attr('data-postfix', '')))
            .append($('<label></label>')
                .attr('data-value', '2')
                .css({
                    'position': 'absolute',
                    'left': '90px',
                    'top': '30px'
                })
                .append($('<span></span>')
                    .attr('data-prefix', ''))
                .append($('<input>')
                    .css({
                        'margin-left': '3px',
                        'width': '48px'
                    })
                    .val('0')
                    .on('keyup', function (evt) {
                        if (evt.keyCode == 13) {
                            this._apply();
                        }
                    }.bind(this)))
                .append($('<span></span>')
                    .attr('data-postfix', '')))
            .append($('<hr>')
                .css({
                    'position': 'absolute',
                    'left': '0px',
                    'right': '0px',
                    'top': '50px'
                }))
            .append($('<div></div>')
                .attr('data-property', 'pivot')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'left': '5px'
                })
                .gPivot())
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'right': '5px'
                })
                // TODO : I18N
                .text('Copies:')
                .append($('<input>')
                    .css({
                        'margin-left': '3px',
                        'width': '38px'
                    })
                    .attr('data-property', 'copies')
                    .val('0')));

        panel.find('button[data-mode]').each(function (index, element) {
            var $element = $(element);
            $element.on('click', function () {
                this._setTransformMode($element.attr('data-mode'));
            }.bind(this))
        }.bind(this));

        this._setTransformMode('Move');
    };

    /** @override */
    GAdjustTransformer.prototype.update = function (document, elements) {
        this._document = document;
        this._elements = elements;

        this._panel.find('[data-property="pivot"]').gPivot('value', IFRect.Side.CENTER);

        return true;
    };

    GAdjustTransformer.prototype._setTransformMode = function (mode) {
        if (this._transformMode) {
            this._savedValues[this._transformMode] = [
                this._panel.find('label[data-value="1"] input').val(),
                this._panel.find('label[data-value="2"] input').val()
            ];
        }

        this._transformMode = mode;

        this._panel.find('button[data-mode]').each(function (index, element) {
            var $element = $(element);
            $element.toggleClass('g-active', $element.attr('data-mode') === mode);
        }.bind(this));

        var _updateLabel = function (labelInfo, number) {
            var label = this._panel.find('label[data-value="' + number.toString() + '"]');
            if (!labelInfo) {
                label.css('display', 'none');
            } else {
                label.css('display', '');
                label.find('span[data-prefix]').text(labelInfo.prefix ? (labelInfo.prefix + ':') : '');
                label.find('span[data-postfix]').text(labelInfo.postfix ? labelInfo.postfix : '');
                label.find('input').val(this._savedValues[mode][number - 1]);
            }
        }.bind(this);

        var transModeInfo = GAdjustTransformer._TransformMode[mode];
        _updateLabel(transModeInfo.label1, 1);
        _updateLabel(transModeInfo.label2, 2);
        this._panel.find('[data-property="pivot"]').css('display', transModeInfo.pivot ? '' : 'none');
    };

    /**
     * @private
     */
    GAdjustTransformer.prototype._apply = function () {
        var scene = this._document.getScene();

        var copies = parseInt(this._panel.find('[data-property="copies"]').val());
        var pivot = this._panel.find('[data-property="pivot"]').gPivot('value');
        var value1 = this._panel.find('label[data-value="1"] input').val();
        var value2 = this._panel.find('label[data-value="2"] input').val();

        var transformFunc = GAdjustTransformer._TransformMode[this._transformMode].transformFunc(value1, value2, scene);

        if (transformFunc) {
            // TODO : I18N
            IFEditor.tryRunTransaction(scene, function () {
                var transformElements = [];
                var bbox = null;
                for (var i = 0; i < this._elements.length; ++i) {
                    var element = this._elements[i];
                    if (pivot) {
                        bbox = bbox ? bbox.united(element.getGeometryBBox()) : element.getGeometryBBox();
                    }
                    var elementElements = [element];

                    if (copies > 0) {
                        var parent = element.getParent();
                        var insertReference = element.getNext() ? element.getNext() : null;
                        for (var c = 0; c < copies; ++c) {
                            var clone = element.clone();
                            if (c == copies - 1) {
                                clone.setFlag(IFNode.Flag.Selected);
                                element.removeFlag(IFNode.Flag.Selected);
                            }
                            parent.insertChild(clone, insertReference);
                            elementElements.push(clone);
                        }
                    }
                    transformElements.push(elementElements);
                }

                var pivotPt = null;
                if (bbox && !bbox.isEmpty()) {
                    pivotPt = bbox.getSide(pivot);
                }
                for (var i = 0; i < transformElements.length; ++i) {
                    var elementElements = transformElements[i];
                    if (elementElements.length > 1) {
                        for (var step = 0; step < elementElements.length; ++step) {
                            transformFunc(step, elementElements[step], pivotPt);
                        }
                    } else if (elementElements.length == 1) {
                        transformFunc(1, elementElements[0], pivotPt);
                    }
                }
            }.bind(this), 'Adjust Transformation');
        }
    };

    /** @override */
    GAdjustTransformer.prototype.toString = function () {
        return "[Object GAdjustTransformer]";
    };

    _.GAdjustTransformer = GAdjustTransformer;
})(this);