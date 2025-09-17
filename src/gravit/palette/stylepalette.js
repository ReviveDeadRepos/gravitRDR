(function (_) {

    /**
     * Style Palette
     * @class GStylePalette
     * @extends GPalette
     * @constructor
     */
    function GStylePalette() {
        GPalette.call(this);
        this._styleEntries = {};
    }

    IFObject.inherit(GStylePalette, GPalette);

    GStylePalette.ID = "style";
    GStylePalette.TITLE = new IFLocale.Key(GStylePalette, "title");

    /**
     * @type {{}}
     * @private
     */
    GStylePalette.prototype._styleEntries = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylePalette.prototype._htmlElement = null;

    /**
     * @type {GDocument}
     * @private
     */
    GStylePalette.prototype._document = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylePalette.prototype._styleDeleteControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylePalette.prototype._styleAddControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylePalette.prototype._styleSelector = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylePalette.prototype._styleSettings = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylePalette.prototype._paintsPanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylePalette.prototype._filtersPanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylePalette.prototype._effectsPanel = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GStylePalette.prototype._styleElements = null;

    /**
     * @type {Array<Array<IFStyle>>}
     * @private
     */
    GStylePalette.prototype._styles = null;

    /**
     * @type {Number}
     * @private
     */
    GStylePalette.prototype._selectedStyleIndex = -1;

    /** @override */
    GStylePalette.prototype.getId = function () {
        return GStylePalette.ID;
    };

    /** @override */
    GStylePalette.prototype.getTitle = function () {
        return GStylePalette.TITLE;
    };

    /** @override */
    GStylePalette.prototype.getGroup = function () {
        return "style";
    };


    /** @override */
    GStylePalette.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /** @override */
    GStylePalette.prototype.init = function (htmlElement, controls) {
        GPalette.prototype.init.call(this, htmlElement, controls);

        this._htmlElement = htmlElement;

        // Init controls
        this._styleAddControl = $('<button></button>')
            // TODO : I18N
            .attr('title', 'Add new style')
            .on('click', function (evt) {
                $('<div></div>')
                    .css({
                        'width': '250px'
                    })
                    .addClass('g-style-list')
                    .gStylePanel({
                        nullStyle: $('<span></span>')
                            .addClass('fa fa-plus-circle')
                            .css({
                                'font-size': '24px',
                                'line-height': '30px'
                            }),
                        // TODO : I18N
                        nullName: 'Add new style to element'
                    })
                    .gStylePanel('attach', this._document.getScene().getStyleCollection())
                    .gOverlay({
                        releaseOnClose: true
                    })
                    .gOverlay('open', evt.target)
                    .on('close', function () {
                        $(this).gStylePanel('detach');
                    })
                    .on('stylechange', function (evt, style) {
                        $(evt.target).gOverlay('close');

                        var styleIndex = -1;
                        var editor = this._document.getEditor();
                        editor.beginTransaction();
                        try {
                            for (var i = 0; i < this._styleElements.length; ++i) {
                                var appliedStyle = null;

                                if (style) {
                                    appliedStyle = new IFLinkedStyle();
                                    appliedStyle.setProperty('ref', style.getReferenceId());
                                } else {
                                    appliedStyle = new IFInlineStyle();
                                }

                                this._styleElements[i].getStyleSet().appendChild(appliedStyle);

                                if (styleIndex < 0) {
                                    styleIndex = this._getStyleIndex(appliedStyle);
                                    this._setSelectedStyle(styleIndex);
                                }
                            }
                        } finally {
                            // TODO : I18N
                            editor.commitTransaction('Add Style');
                        }
                    }.bind(this));
            }.bind(this))
            .append($('<span></span>')
                .addClass('fa fa-plus'))
            .appendTo(controls);

        this._styleDeleteControl = $('<button></button>')
            // TODO : I18N
            .attr('title', 'Remove hidden styles')
            .on('click', function () {
                var editor = this._document.getEditor();
                editor.beginTransaction();
                try {
                    var styles = this._styles.slice();
                    for (var i = 0; i < styles.length; ++i) {
                        var style = styles[i].slice();
                        for (var j = 0; j < style.length; ++j) {
                            if (style[j].getProperty('vs') === false) {
                                style[j].getParent().removeChild(style[j]);
                            }
                        }
                    }
                } finally {
                    // TODO : I18N
                    editor.commitTransaction('Removed Hidden Styles');
                }
            }.bind(this))
            .append($('<span></span>')
                .addClass('fa fa-trash-o'))
            .appendTo(controls);

        var filterEntries = [];
        var effectEntries = [];

        // Initialize all style entry handlers and create menus for them
        for (var i = 0; i < gravit.styleEntries.length; ++i) {
            var styleEntry = gravit.styleEntries[i];
            var entryClass = styleEntry.getEntryClass();
            this._styleEntries[IFObject.getTypeId(entryClass)] = styleEntry;

            if (IFFilterEntry.prototype.isPrototypeOf(styleEntry.getEntryClass().prototype)) {
                filterEntries.push({
                    entry: styleEntry,
                    name: ifLocale.get(styleEntry.getEntryName())
                });
            } else if (IFEffectEntry.prototype.isPrototypeOf(styleEntry.getEntryClass().prototype)) {
                effectEntries.push({
                    entry: styleEntry,
                    name: ifLocale.get(styleEntry.getEntryName()),
                    rootClass: IFEffectEntry
                });
            } else if (IFVEffectEntry.prototype.isPrototypeOf(styleEntry.getEntryClass().prototype)) {
                effectEntries.push({
                    entry: styleEntry,
                    name: ifLocale.get(styleEntry.getEntryName()),
                    rootClass: IFVEffectEntry
                });
            }
        }

        // Order filters by name, effects by type and name
        filterEntries.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
        effectEntries.sort(function (a, b) {
            if (a.rootClass === b.rootClass) {
                return a.name.localeCompare(b.name);
            } else {
                return a.rootClass === IFVEffectEntry ? -1 : 1;
            }
        });

        // Handler for adding a new style entry menu item
        var _addStyleEntryMenu = function (styleEntryClass, name, menu) {
            // TODO : I18N
            menu.createAddItem('Add ' + name, function () {
                this._modifyEachSelectedStyle(function (style) {
                    style.getActualStyle().appendChild(new styleEntryClass());
                });
            }.bind(this));
        }.bind(this);

        // Add style selector
        this._styleSelector = $('<div></div>')
            .addClass('style-selector')
            .gStylePanel({
                allowDrop: true,
                previewWidth: 40,
                previewHeight: 40
            })
            .on('stylechange', function (evt, style) {
                this._setSelectedStyle(this._getStyleIndex(style));
            }.bind(this))
            .on('styledragaway', function (evt, style) {
                var styleIndex = this._getStyleIndex(style);
                var styles = this._styles[styleIndex];
                var editor = this._document.getEditor();
                editor.beginTransaction();
                try {
                    for (var i = 0; i < styles.length; ++i) {
                        styles[i].getParent().removeChild(styles[i]);
                    }
                } finally {
                    // TODO : I18N
                    editor.commitTransaction('Remove Style');
                }
            }.bind(this))
            .on('stylemove', function (evt, sourceStyle, targetStyle) {
                var sourceStyleIndex = this._getStyleIndex(sourceStyle);
                var targetStyleIndex = this._getStyleIndex(targetStyle);
                var sourceStyles = this._styles[sourceStyleIndex].slice();
                var targetStyles = this._styles[targetStyleIndex].slice();
                this._selectedStyleIndex = -1;
                var editor = this._document.getEditor();

                editor.beginTransaction();
                try {
                    for (var i = 0; i < sourceStyles.length; ++i) {
                        var parent = sourceStyles[i].getParent();
                        parent.removeChild(sourceStyles[i]);
                        parent.insertChild(sourceStyles[i], sourceStyleIndex < targetStyleIndex ? targetStyles[i].getNext() : targetStyles[i]);
                    }
                } finally {
                    // TODO : I18N
                    editor.commitTransaction('Move Style');
                }

                this._setSelectedStyle(this._getStyleIndex(sourceStyle));
            }.bind(this))
            .appendTo(this._htmlElement);

        // Style settings
        this._styleSettings = $('<div></div>')
            .addClass('style-settings')
            .append($('<div></div>')
                .addClass('visibility')
                .append($('<span></span>')
                    .addClass('fa')
                    // TODO : I18N
                    .attr('title', 'Toggle Style Visibility')
                    .on('click', function () {
                        var makeVisible = this._styles[this._selectedStyleIndex][0].getProperty('vs') === false;
                        this._modifyEachSelectedStyle(function (style) {
                            style.setProperty('vs', makeVisible);
                        });
                    }.bind(this))))
            .append($('<div></div>')
                .css('width', '100%')
                .append($('<select></select>')
                    .attr('data-property', 'blm')
                    .gBlendMode()
                    .on('change', function (evt) {
                        var val = $(evt.target).val();
                        this._modifyEachSelectedStyle(function (style) {
                            style.setProperty('blm', val);
                        });
                    }.bind(this)))
                .append($('<input>')
                    .attr('data-property', 'opc')
                    .css('width', '3em')
                    .on('change', function (evt) {
                        var opacity = IFLength.parseEquationValue($(evt.target).val());
                        if (opacity !== null) {
                            opacity = opacity < 0 ? 0 : opacity > 100 ? 100 : opacity;
                            opacity /= 100.0;
                            this._modifyEachSelectedStyle(function (style) {
                                style.setProperty('opc', opacity);
                            });
                        } else {
                            this._updateStyleSettings();
                        }
                    }.bind(this)))
                .append($('<select></select>')
                    .attr('data-property', 'tp')
                    .append($('<option></option>')
                        .attr('value', IFAppliedStyle.Type.Content)
                        // TODO : I18N
                        .text('Content'))
                    .append($('<option></option>')
                        .attr('value', IFAppliedStyle.Type.Knockout)
                        // TODO : I18N
                        .text('Knockout'))
                    /* TODO
                     .append($('<option></option>')
                     .attr('value', IFAppliedStyle.Type.Mask)
                     // TODO : I18N
                     .text('Mask'))
                     .append($('<option></option>')
                     .attr('value', IFAppliedStyle.Type.Background)
                     // TODO : I18N
                     .text('Background'))*/
                    .on('change', function (evt) {
                        var val = $(evt.target).val();
                        this._modifyEachSelectedStyle(function (style) {
                            style.setProperty('tp', val);
                        });
                    }.bind(this))))
            .append($('<div></div>')
                .css('text-align', 'right')
                .append($('<button></button>')
                    .attr('data-property', '__link')
                    .on('click', function () {
                        this._toggleStyleLink();
                    }.bind(this))
                    .append($('<span></span>')
                        .addClass('fa'))))
            .appendTo(this._htmlElement);

        // Paints section
        this._paintsPanel = $('<div></div>')
            .addClass('style-entries-panel')
            .append($('<div></div>')
                .addClass('style-entries-panel-table'));

        $('<div></div>')
            .gPanel({
                // TODO : I18N
                title: 'Fills & Borders',
                content: this._paintsPanel,
                controls: [
                    $('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Add Stroke')
                        .on('click', function () {
                            this._modifyEachSelectedStyle(function (style) {
                                style.getActualStyle().appendChild(new IFStrokePaint());
                            });
                        }.bind(this))
                        .append($('<span></span>')
                            .addClass('fa fa-pencil')),
                    $('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Add Fill')
                        .on('click', function () {
                            this._modifyEachSelectedStyle(function (style) {
                                style.getActualStyle().appendChild(new IFFillPaint());
                            });
                        }.bind(this))
                        .append($('<span></span>')
                            .addClass('fa fa-stop')),
                    $('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Remove hidden entries')
                        .on('click', function () {
                            this._removeHiddenEntries([IFPaintEntry]);
                        }.bind(this))
                        .append($('<span></span>')
                            .addClass('fa fa-trash-o'))
                ]
            })
            .appendTo(this._htmlElement);

        // Filter section
        var filtersAddMenu = new GMenu();
        for (var i = 0; i < filterEntries.length; ++i) {
            // TODO : I18N
            _addStyleEntryMenu(filterEntries[i].entry.getEntryClass(), filterEntries[i].name, filtersAddMenu);
        }

        this._filtersPanel = $('<div></div>')
            .addClass('style-entries-panel')
            .append($('<div></div>')
                .addClass('style-entries-panel-table'))
            .appendTo(this._htmlElement);

        $('<div></div>')
            .gPanel({
                // TODO : I18N
                title: 'Filters',
                content: this._filtersPanel,
                controls: [
                    $('<button></button>')
                        .gMenuButton({
                            menu: filtersAddMenu,
                            arrow: false
                        })
                        .append($('<span></span>')
                            .addClass('fa fa-plus')),
                    $('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Remove hidden entries')
                        .on('click', function () {
                            this._removeHiddenEntries([IFFilterEntry]);
                        }.bind(this))
                        .append($('<span></span>')
                            .addClass('fa fa-trash-o'))
                ]
            })
            .appendTo(this._htmlElement);

        // Effects section
        var effectsAddMenu = new GMenu();
        var hasRasterEffect = false;
        for (var i = 0; i < effectEntries.length; ++i) {
            var entryClass = effectEntries[i].entry.getEntryClass();
            var rootClass = effectEntries[i].rootClass;
            if (!hasRasterEffect && rootClass === IFEffectEntry) {
                effectsAddMenu.createAddDivider();
                hasRasterEffect = true;
            }

            _addStyleEntryMenu(entryClass, effectEntries[i].name, effectsAddMenu);
        }

        this._effectsPanel = $('<div></div>')
            .addClass('style-entries-panel')
            .append($('<div></div>')
                .addClass('style-entries-panel-table'))
            .appendTo(this._htmlElement);

        $('<div></div>')
            .gPanel({
                // TODO : I18N
                title: 'Effects',
                content: this._effectsPanel,
                controls: [
                    $('<button></button>')
                        .gMenuButton({
                            menu: effectsAddMenu,
                            arrow: false
                        })
                        .append($('<span></span>')
                            .addClass('fa fa-plus')),
                    $('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Remove hidden entries')
                        .on('click', function () {
                            this._removeHiddenEntries([IFEffectEntry, IFVEffectEntry]);
                        }.bind(this))
                        .append($('<span></span>')
                            .addClass('fa fa-trash-o'))
                ]
            })
            .appendTo(this._htmlElement);
    };

    /** @override */
    GStylePalette.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            var editor = this._document.getEditor();

            // Subscribe to scene events
            scene.addEventListener(IFNode.AfterInsertEvent, this._afterInsert, this);
            scene.addEventListener(IFNode.BeforeRemoveEvent, this._beforeRemove, this);
            scene.addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            scene.addEventListener(IFStyle.StyleChangeEvent, this._styleChange, this);

            // Subscribe to the editor's events
            editor.addEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);

            this._updateFromSelection();

            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            var editor = this._document.getEditor();

            // Unsubscribe from the editor's events
            editor.removeEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection);

            // Unsubscribe from scene events
            scene.removeEventListener(IFNode.AfterInsertEvent, this._afterInsert, this);
            scene.removeEventListener(IFNode.BeforeRemoveEvent, this._beforeRemove, this);
            scene.removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            scene.removeEventListener(IFNode.StyleChangeEvent, this._styleChange, this);

            this._document = null;
            this._styleElements = null;
            this._styles = null;
            this._selectedStyleIndex = -1;
            this._updateSelectedStyle();

            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /**
     * @param {IFNode.AfterInsertEvent} evt
     * @private
     */
    GStylePalette.prototype._afterInsert = function (evt) {
        if (evt.node instanceof IFStyleEntry) {
            var style = evt.node.getOwnerStyle();
            if (style && this._isSelectedStyle(style)) {
                this._insertEntryRow(evt.node);
            }
        } else if (evt.node instanceof IFStyle) {
            this._insertStyles(evt.node);
        }
    };

    /**
     * @param {IFNode.BeforeRemoveEvent} evt
     * @private
     */
    GStylePalette.prototype._beforeRemove = function (evt) {
        if (evt.node instanceof IFStyleEntry) {
            var style = evt.node.getOwnerStyle();
            if (style && this._isSelectedStyle(style)) {
                this._removeEntryRow(evt.node);
            }
        } else if (evt.node instanceof IFStyle) {
            this._removeStyle(evt.node);
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} evt
     * @private
     */
    GStylePalette.prototype._afterPropertiesChange = function (evt) {
        if (evt.node instanceof IFStyleEntry) {
            var style = evt.node.getOwnerStyle();
            if (style && this._isSelectedStyle(style)) {
                this._updateEntryRow(evt.node);
            }
        } else if (evt.node instanceof IFStyle && this._isSelectedStyle(evt.node)) {
            this._updateStyleSettings();
        }
    };

    /**
     * @param {IFStyle.StyleChangeEvent} evt
     * @private
     */
    GStylePalette.prototype._styleChange = function (evt) {
        var styleIndex = this._getStyleIndex(evt.style, false);
        if (styleIndex >= 0 && styleIndex === this._selectedStyleIndex) {
            var style = this._styles[styleIndex][0];
            this._styleSelector.gStylePanel('updateStyle', style);
        }
    };

    /**
     * @private
     */
    GStylePalette.prototype._updateFromSelection = function () {
        this._styleElements = null;
        this._styles = null;
        this._selectedStyleIndex = -1;
        var selection = this._document.getEditor().getSelection();

        // Figure our available style elements
        if (selection && selection.length > 0) {
            for (var i = 0; i < selection.length; ++i) {
                var element = selection[i];
                if (element.hasMixin(IFElement.Style)) {
                    if (!this._styleElements) {
                        this._styleElements = [];
                    }

                    this._styleElements.push(element);
                }
            }
        }

        // Clear style selector
        this._styleSelector.gStylePanel('clear');

        if (this._styleElements) {
            this._insertStyles();
        }

        // Reset style selection if there're no styles
        if (!this._styles) {
            this._setSelectedStyle(-1);
        }
    };

    GStylePalette.prototype._setSelectedStyle = function (selectedIndex) {
        this._styleSelector.gStylePanel('value', selectedIndex >= 0 ? this._styles[selectedIndex][0] : null);
        this._selectedStyleIndex = selectedIndex;
        this._updateSelectedStyle();
    };

    GStylePalette.prototype._modifyEachSelectedStyle = function (modifier, styleIndex) {
        if (typeof styleIndex === 'number' || this._selectedStyleIndex >= 0) {
            var editor = this._document.getEditor();
            editor.beginTransaction();
            try {
                this._visitEachSelectedStyle(modifier, styleIndex);
            } finally {
                // TODO : I18N
                editor.commitTransaction('Modify Style(s)');
            }
        }
    };

    GStylePalette.prototype._visitEachSelectedStyle = function (visitor, styleIndex) {
        if (typeof styleIndex === 'number' || this._selectedStyleIndex >= 0) {
            var style = this._styles[this._selectedStyleIndex >= 0 ? this._selectedStyleIndex : styleIndex].slice();
            for (var i = 0; i < style.length; ++i) {
                visitor(style[i]);
            }
        }
    };

    GStylePalette.prototype._insertStyles = function (style) {
        var _addStyleBlock = function (style, index) {
            this._styleSelector.gStylePanel('insertStyle', style, index);
        }.bind(this);

        var _addStyles = function (styles) {
            var canAddStyles = false;

            if (style) {
                for (var i = 0; i < styles.length; ++i) {
                    if (styles[i] === style) {
                        canAddStyles = true;
                        break;
                    }
                }
            } else {
                canAddStyles = true;
            }

            if (canAddStyles && this._styles && this._styles.length > 0) {
                // Make sure the styles doesn't yet exist in our containers
                for (var i = 0; i < this._styles.length; ++i) {
                    if (this._styles[i][0] === styles[0]) {
                        canAddStyles = false;
                        break;
                    }
                }
            }

            if (canAddStyles) {
                // Figure the right insertion point for the style
                var style = styles[0];
                var nextStyleIndex = -1;
                for (var next = style.getNext(); next !== null; next = next.getNext()) {
                    if (next instanceof IFStyle) {
                        nextStyleIndex = this._getStyleIndex(next);
                        break;
                    }
                }

                if (!this._styles) {
                    this._styles = [];
                }

                if (nextStyleIndex >= 0) {
                    this._styles.splice(nextStyleIndex, 0, styles);
                } else {
                    this._styles.push(styles);
                }

                _addStyleBlock(styles[0], nextStyleIndex);
            }
        }.bind(this);

        if (!this._styleElements || this._styleElements.length === 0) {
            // NO-OP w/o stylable elements
            return;
        }

        if (this._styleElements.length === 1) {
            // Easy-peacy, add all styles from element
            var styleSet = this._styleElements[0].getStyleSet();
            for (var node = styleSet.getFirstChild(); node !== null; node = node.getNext()) {
                if (node instanceof IFStyle) {
                    _addStyles([node]);
                }
            }
        } else {
            // Iterate and add the first, non-linked style as default one
            // as well as add all linked styles that are common to _all_ elements
            var linkedStyles = [];
            var defaultStyles = [];

            for (var i = 0; i < this._styleElements.length; ++i) {
                var styleSet = this._styleElements[i].getStyleSet();
                var hasDefaultStyle = false;
                for (var node = styleSet.getFirstChild(); node !== null; node = node.getNext()) {
                    if (node instanceof IFLinkedStyle) {
                        var hasLinkedStyle = false;
                        for (var j = 0; j < linkedStyles.length; ++j) {
                            if (linkedStyles[j][0].getProperty('ref') === node.getProperty('ref')) {
                                linkedStyles[j].push(node);
                                hasLinkedStyle = true;
                                break;
                            }
                        }

                        if (!hasLinkedStyle) {
                            linkedStyles.push([node]);
                        }
                    }
                    else if (node instanceof IFInlineStyle) {
                        if (!hasDefaultStyle) {
                            defaultStyles.push(node);
                        }
                        hasDefaultStyle = true;
                    }
                }
            }

            // Add default style if common to all elements
            if (defaultStyles.length === this._styleElements.length) {
                _addStyles(defaultStyles);
            }

            // Add all linked styles if they're common to all elements
            for (var i = 0; i < linkedStyles.length; ++i) {
                if (linkedStyles[i].length === this._styleElements.length) {
                    _addStyles(linkedStyles[i]);
                }
            }
        }

        // Make default selection if there's none yet
        if (this._selectedStyleIndex < 0 && this._styles && this._styles.length > 0) {
            this._setSelectedStyle(0);
        }
    };

    GStylePalette.prototype._removeStyle = function (style) {
        if (this._styles) {
            var styleIndex = this._getStyleIndex(style);

            if (styleIndex >= 0) {
                // Remove from style selector
                this._styleSelector.gStylePanel('removeStyle', this._styles[styleIndex][0]);

                // Remove from styles array
                this._styles.splice(styleIndex, 1);

                // Update selected style if active
                if (styleIndex === this._selectedStyleIndex) {
                    this._setSelectedStyle(this._styles.length > 0 ? 0 : -1);
                } else if (styleIndex < this._selectedStyleIndex) {
                    this._selectedStyleIndex -= 1;
                }

                // Update style selector when there's no styles
                if (this._styles.length === 0) {
                    this._styles = null;
                    this._styleSelector.css('display', 'none');
                }
            }
        }
    };

    GStylePalette.prototype._isSelectedStyle = function (style) {
        return this._selectedStyleIndex >= 0 && this._getStyleIndex(style, true) === this._selectedStyleIndex;
    };

    GStylePalette.prototype._getStyleIndex = function (style, handleSharedStyles) {
        if (!this._styles || this._styles.length === 0) {
            return -1;
        }

        for (var i = 0; i < this._styles.length; ++i) {
            for (var j = 0; j < this._styles[i].length; ++j) {
                if (style instanceof IFSharedStyle && handleSharedStyles) {
                    if (this._styles[i][j] instanceof IFLinkedStyle && this._styles[i][j].getProperty('ref') === style.getReferenceId()) {
                        return i;
                    }
                } else {
                    if (this._styles[i][j] === style) {
                        return i;
                    }
                }
            }
        }

        return -1;
    };

    GStylePalette.prototype._removeHiddenEntries = function (entryClasses) {
        this._modifyEachSelectedStyle(function (style) {
            var style = style.getActualStyle();
            var removal = [];

            for (var entry = style.getFirstChild(); entry !== null; entry = entry.getNext()) {
                if (entry instanceof IFStyleEntry && entry.getProperty('vs') === false) {
                    for (var j = 0; j < entryClasses.length; ++j) {
                        if (entryClasses[j].prototype.isPrototypeOf(entry)) {
                            removal.push(entry);
                            break;
                        }
                    }
                }
            }

            for (var i = 0; i < removal.length; ++i) {
                style.removeChild(removal[i]);
            }
        });
    };

    GStylePalette.prototype._toggleStyleLink = function () {
        var activeStyle = this._styles[this._selectedStyleIndex][0];
        if (activeStyle instanceof IFLinkedStyle) {
            // Unlink
            var editor = this._document.getEditor();
            var scene = this._document.getScene();
            editor.beginTransaction();
            try {
                // Get the shared style reference
                var sharedStyle = activeStyle.getActualStyle();

                // Save selected style index
                var selectedStyleIndex = this._selectedStyleIndex;

                // Replace all active style nodes with a new inline style
                this._visitEachSelectedStyle(function (style) {
                    // Create new inline style
                    var inlineStyle = new IFInlineStyle();

                    // Transfer style
                    inlineStyle.transferProperties(style, [IFAppliedStyle.GeometryProperties, IFAppliedStyle.VisualProperties]);
                    for (var child = sharedStyle.getFirstChild(); child !== null; child = child.getNext()) {
                        if (child instanceof IFStyleEntry) {
                            inlineStyle.appendChild(child.clone());
                        }
                    }

                    // Insert before actual style
                    style.getParent().insertChild(inlineStyle, style);

                    // Remove original style
                    style.getParent().removeChild(style);
                });

                // Re-assign selected style
                this._setSelectedStyle(selectedStyleIndex);
            } finally {
                // TODO : I18N
                editor.commitTransaction('Unlink Style');
            }
        } else {
            // Link
            var scene = this._document.getScene();

            // TODO : I18N
            var styleDefaultName = 'Style-' + (scene.getStyleCollection().queryCount('> sharedStyle') + 1).toString();
            var name = prompt('Enter a name for the new style:', styleDefaultName);
            if (name !== null) {
                if (name.trim() === '') {
                    name = styleDefaultName;
                }

                var editor = this._document.getEditor();
                editor.beginTransaction();
                try {
                    // Create our shared style
                    var sharedStyle = new IFSharedStyle();
                    sharedStyle.setProperty('name', name);

                    // Transfer style
                    for (var child = activeStyle.getFirstChild(); child !== null; child = child.getNext()) {
                        if (child instanceof IFStyleEntry) {
                            sharedStyle.appendChild(child.clone());
                        }
                    }

                    // Add the shared style to our collection
                    scene.getStyleCollection().appendChild(sharedStyle);

                    // Save selected style index
                    var selectedStyleIndex = this._selectedStyleIndex;

                    // Replace all active style nodes with a new linked style
                    this._visitEachSelectedStyle(function (style) {
                        // Insert new linked style before
                        var linkedStyle = new IFLinkedStyle();
                        linkedStyle.transferProperties(style, [IFAppliedStyle.GeometryProperties, IFAppliedStyle.VisualProperties]);
                        linkedStyle.setProperty('ref', sharedStyle.getReferenceId());
                        style.getParent().insertChild(linkedStyle, style);

                        // Remove original style
                        style.getParent().removeChild(style);
                    });

                    // Re-assign selected style
                    this._setSelectedStyle(selectedStyleIndex);
                } finally {
                    // TODO : I18N
                    editor.commitTransaction('Link Style');
                }
            }
        }
    };

    GStylePalette.prototype._updateSelectedStyle = function () {
        this._styleSelector.css('display', this._styles ? '' : 'none');
        this._updateStyleSettings();
        this._updateEntries();
    };

    GStylePalette.prototype._updateStyleSettings = function () {
        this._styleSettings.css('display', 'none');
        this._styleDeleteControl.prop('disabled', true);
        this._styleAddControl.prop('disabled', this._styleElements === null || this._styleElements.length === 0);

        if (this._selectedStyleIndex >= 0) {
            this._styleSettings.css('display', '');
            var style = this._styles[this._selectedStyleIndex][0];

            this._styleSettings.find('.visibility > span')
                .toggleClass('fa-eye', style.getProperty('vs') == true)
                .toggleClass('fa-eye-slash', style.getProperty('vs') == false)

            this._styleSettings.find('[data-property="__link"]')
                // TODO : I18N
                .attr('title', style instanceof IFLinkedStyle ? 'Unlink style' : 'Link style')
                /* !! */
                .find('> span')
                .toggleClass('fa-link', !(style instanceof IFLinkedStyle))
                .toggleClass('fa-unlink', style instanceof IFLinkedStyle);

            this._styleDeleteControl.prop('disabled', false);

            this._styleSettings.find('[data-property="blm"]').val(style.getProperty('blm'));
            this._styleSettings.find('[data-property="opc"]').val(ifUtil.formatNumber(style.getProperty('opc') * 100));

            this._styleSettings.find('[data-property="tp"]').val(style.getProperty('tp'));
        }
    };

    GStylePalette.prototype._updateEntries = function () {
        this._paintsPanel.closest('.g-panel').css('display', 'none');
        this._paintsPanel.find('.style-entries-panel-table').empty();
        this._filtersPanel.closest('.g-panel').css('display', 'none');
        this._filtersPanel.find('.style-entries-panel-table').empty();
        this._effectsPanel.closest('.g-panel').css('display', 'none');
        this._effectsPanel.find('.style-entries-panel-table').empty();

        if (this._selectedStyleIndex >= 0) {
            this._paintsPanel.closest('.g-panel').css('display', '');
            this._filtersPanel.closest('.g-panel').css('display', '');
            this._effectsPanel.closest('.g-panel').css('display', '');
            var style = this._styles[this._selectedStyleIndex][0].getActualStyle();

            for (var entry = style.getFirstChild(); entry !== null; entry = entry.getNext()) {
                if (entry instanceof IFStyleEntry) {
                    this._insertEntryRow(entry);
                }
            }
        }
    };

    var dragRow = null;
    var hasDropped = false;

    GStylePalette.prototype._insertEntryRow = function (entry) {
        var handler = this._styleEntries[IFObject.getTypeId(entry)];

        if (handler) {
            var panel = this._getPanelFromEntry(entry);
            var table = panel.find('.style-entries-panel-table');

            var assign = function () {
                this._assignEntryRow(entry);
            }.bind(this);

            var revert = function () {
                this._updateEntryRow(entry);
            }.bind(this);

            var contents = handler.createContent(this._document.getScene(), assign, revert);

            var _canDrop = function (source, target) {
                return source && target && source !== target && source.parentNode === target.parentNode;
            };

            var row = $('<div></div>')
                .data('entry', entry)
                .attr('draggable', 'true')
                .on('dragstart', function (evt) {
                    var $this = $(this);

                    var event = evt.originalEvent;
                    event.stopPropagation();

                    event.dataTransfer.effectAllowed = 'move';
                    // dummy data as some browser may not drag otherwise
                    event.dataTransfer.setData('text/plain', '');
                    this.className = 'drag';
                    dragRow = this;
                    hasDropped = false;

                    // Add drag overlays
                    $this.closest('.style-entries-panel-table').find('> div').each(function (index, element) {
                        $(element)
                            .append($('<div></div>')
                                .addClass('drag-overlay')
                                .on('dragenter', function (evt) {
                                    if (_canDrop(dragRow, this.parentNode)) {
                                        $(this).parent().addClass('drop');
                                    }
                                })
                                .on('dragleave', function (evt) {
                                    if (_canDrop(dragRow, this.parentNode)) {
                                        $(this).parent().removeClass('drop');
                                    }
                                })
                                .on('dragover', function (evt) {
                                    var event = evt.originalEvent;
                                    // Let everything to through to escalate a drop
                                    // event, we'll check later if possible or not
                                    event.preventDefault();
                                    event.stopPropagation();
                                    event.dataTransfer.dropEffect = 'move';
                                })
                                .on('drop', function (evt) {
                                    var $this = $(this);
                                    var $parent = $(this.parentNode);

                                    hasDropped = true;
                                    $parent.removeClass('drop');

                                    // Remove drag overlays
                                    $parent.closest('.style-entries-panel-table').find('.drag-overlay').remove();

                                    if (_canDrop(dragRow, this.parentNode)) {
                                        // TODO : Move our entry
                                    }
                                }));
                    });
                })
                .on('dragend', function (evt) {
                    var $this = $(this);

                    var event = evt.originalEvent;
                    event.stopPropagation();

                    // Remove drag overlays
                    $this.closest('.style-entries-panel-table').find('.drag-overlay').remove();

                    // Delete our entry when not dropped
                    if (!hasDropped) {
                        // TODO : Undo + Redo + Apply to all
                        entry.getParent().removeChild(entry);
                    }

                    this.className = '';
                    dragRow = null;
                    hasDropped = false;
                })
                .append($('<div></div>')
                    .addClass('visibility')
                    .append($('<span></span>')
                        // TODO : I18N
                        .attr('title', 'Toggle visibility')
                        .on('click', function () {
                            // TODO : Undo + Redo + Apply to all
                            entry.setProperty('vs', !entry.getProperty('vs'));
                        })))
                .append($('<div></div>')
                    .addClass('contents')
                    .append(contents))
                .appendTo(table);

            this._updateEntryRow(entry, row);
        }
    };

    GStylePalette.prototype._removeEntryRow = function (entry, row) {
        row = row || this._getRowForEntry(entry);

        if (row) {
            row.remove();
        }
    };

    GStylePalette.prototype._updateEntryRow = function (entry, row) {
        var handler = this._styleEntries[IFObject.getTypeId(entry)];

        if (handler) {
            row = row || this._getRowForEntry(entry);

            if (row) {
                row.find('.visibility span').attr('class', 'fa fa-eye' + (!entry.getProperty('vs') ? '-slash' : ''));
                handler.updateProperties(row.find('.contents > :first-child'), row.data('entry'), this._document.getScene());
            }
        }
    };

    GStylePalette.prototype._assignEntryRow = function (entry, row) {
        var handler = this._styleEntries[IFObject.getTypeId(entry)];

        if (handler) {
            row = row || this._getRowForEntry(entry);

            if (row) {
                var editor = this._document.getEditor();
                editor.beginTransaction();
                try {
                    handler.assignProperties(row.find('.contents > :first-child'), entry, this._document.getScene());
                } finally {
                    // TODO : I18N
                    editor.commitTransaction('Modify ' + handler.getEntryName() + ' Style');
                }
            }
        }
    };

    GStylePalette.prototype._getRowForEntry = function (entry) {
        var panel = this._getPanelFromEntry(entry);
        var table = panel.find('.style-entries-panel-table');

        var result = null;
        table.find('> div').each(function (index, element) {
            var $element = $(element);
            if ($element.data('entry') === entry) {
                result = $element;
                return false;
            }
        });

        return result;
    };

    GStylePalette.prototype._getPanelFromEntry = function (entry) {
        if (entry instanceof IFPaintEntry) {
            return this._paintsPanel;
        } else if (entry instanceof IFFilterEntry) {
            return this._filtersPanel;
        } else if (entry instanceof IFEffectEntry || entry instanceof IFVEffectEntry) {
            return this._effectsPanel;
        }
    };

    /** @override */
    GStylePalette.prototype.toString = function () {
        return "[Object GStylePalette]";
    };

    _.GStylePalette = GStylePalette;
})(this);