(function ($) {
    /** @enum */
    var ViewType = {
        Palette: 'palette',
        Swatches: 'swatches',
        Trends: 'trends',
        Image: 'image'
    };

    /**
     * @private
     */
    ColorModes = [
        {
            type: IFColor.Type.RGB,
            name: 'RGB',
            components: [
                {
                    label: 'R',
                    min: 0,
                    max: 255,
                    unit: ' ',
                    stops: function (components) {
                        var rgba = components;
                        return [
                            new IFColor(IFColor.Type.RGB, [0, rgba[1], rgba[2], 100]),
                            new IFColor(IFColor.Type.RGB, [255, rgba[1], rgba[2], 100]),
                        ];
                    }
                },
                {
                    label: 'G',
                    min: 0,
                    max: 255,
                    unit: ' ',
                    stops: function (components) {
                        var rgba = components;
                        return [
                            new IFColor(IFColor.Type.RGB, [rgba[0], 0, rgba[2], 100]),
                            new IFColor(IFColor.Type.RGB, [rgba[0], 255, rgba[2], 100]),
                        ];
                    }
                },
                {
                    label: 'B',
                    min: 0,
                    max: 255,
                    unit: ' ',
                    stops: function (components) {
                        var rgba = components;
                        return [
                            new IFColor(IFColor.Type.RGB, [rgba[0], rgba[1], 0, 100]),
                            new IFColor(IFColor.Type.RGB, [rgba[0], rgba[1], 255, 100]),
                        ];
                    }
                },
                {
                    label: 'A',
                    min: 0,
                    max: 100,
                    unit: '%'
                }
            ],
            makeColor: function (components) {
                return new IFColor(IFColor.Type.RGB, components);
            }
        },
        {
            type: IFColor.Type.HSL,
            name: 'HSL',
            components: [
                {
                    label: 'H',
                    min: 0,
                    max: 360,
                    unit: '° ',
                    stops: function (components) {
                        var hsla = components;
                        var result = [];
                        var steps = 60;
                        for (var i = 0; i <= 360; i += steps) {
                            result.push(new IFColor(IFColor.Type.HSL, [i, hsla[1], hsla[2], 100]));
                        }
                        return result;
                    }
                },
                {
                    label: 'S',
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        var hsla = components;
                        return [
                            new IFColor(IFColor.Type.HSL, [hsla[0], 0, hsla[2], 100]),
                            new IFColor(IFColor.Type.HSL, [hsla[0], 100, hsla[2], 100]),
                        ];
                    }
                },
                {
                    label: 'L',
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        var hsla = components;
                        return [
                            new IFColor(IFColor.Type.HSL, [hsla[0], hsla[1], 0, 100]),
                            new IFColor(IFColor.Type.HSL, [hsla[0], hsla[1], 100, 100]),
                        ];
                    }
                },
                {
                    label: 'A',
                    min: 0,
                    max: 100,
                    unit: '%'
                }
            ],
            makeColor: function (components) {
                return new IFColor(IFColor.Type.HSL, components);
            }
        },
        {
            type: IFColor.Type.Tone,
            name: 'Tone',
            components: [
                {
                    label: 'T',
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        return [IFColor.parseCSSColor('white'), IFColor.parseCSSColor('black')];
                    }
                },
                {
                    label: 'A',
                    min: 0,
                    max: 100,
                    unit: '%'
                }
            ],
            makeColor: function (components) {
                return new IFColor(IFColor.Type.Tone, components);
            }
        },

        {
            type: IFColor.Type.CMYK,
            name: 'CMYK',
            components: [
                {
                    label: 'C',
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        var cmyk = components;
                        return [
                            new IFColor(IFColor.Type.CMYK, [0, cmyk[1], cmyk[2], cmyk[3]]),
                            new IFColor(IFColor.Type.CMYK, [100, cmyk[1], cmyk[2], cmyk[3]]),
                        ];
                    }
                },
                {
                    label: 'M',
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        var cmyk = components;
                        return [
                            new IFColor(IFColor.Type.CMYK, [cmyk[0], 0, cmyk[2], cmyk[3]]),
                            new IFColor(IFColor.Type.CMYK, [cmyk[0], 100, cmyk[2], cmyk[3]]),
                        ];
                    }
                },
                {
                    label: 'Y',
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        var cmyk = components;
                        return [
                            new IFColor(IFColor.Type.CMYK, [cmyk[0], cmyk[1], 0, cmyk[3]]),
                            new IFColor(IFColor.Type.CMYK, [cmyk[0], cmyk[1], 100, cmyk[3]]),
                        ];
                    }
                },
                {
                    label: 'K',
                    min: 0,
                    max: 100,
                    unit: '%',
                    stops: function (components) {
                        var cmyk = components;
                        return [
                            new IFColor(IFColor.Type.CMYK, [cmyk[0], cmyk[1], cmyk[2], 0]),
                            new IFColor(IFColor.Type.CMYK, [cmyk[0], cmyk[1], cmyk[2], 100]),
                        ];
                    }
                }
            ],
            makeColor: function (components) {
                return new IFColor(IFColor.Type.CMYK, components);
            }
        }
    ];

    var MAX_SWATCHES_PER_ROW = 21;

    // 21 per row
    var PALETTE = [
        '000000', '001F3F', 'DDDDDD', '000000', '003300', '006600', '009900', '00CC00', '00FF00', '330000', '333300', '336600', '339900', '33CC00', '33FF00', '660000', '663300', '666600', '669900', '66CC00', '66FF00',
        '333333', '0074D9', 'CCCCCC', '000033', '003333', '006633', '009933', '00CC33', '00FF33', '330033', '333333', '336633', '339933', '33CC33', '33FF33', '660033', '663333', '666633', '669933', '66CC33', '66FF33',
        '666666', '7FDBFF', 'BBBBBB', '000066', '003366', '006666', '009966', '00CC66', '00FF66', '330066', '333366', '336666', '339966', '33CC66', '33FF66', '660066', '663366', '666666', '669966', '66CC66', '66FF66',
        '999999', '39CCCC', 'AAAAAA', '000099', '003399', '006699', '009999', '00CC99', '00FF99', '330099', '333399', '336699', '339999', '33CC99', '33FF99', '660099', '663399', '666699', '669999', '66CC99', '66FF99',
        'CCCCCC', '3D9970', '999999', '0000CC', '0033CC', '0066CC', '0099CC', '00CCCC', '00FFCC', '3300CC', '3333CC', '3366CC', '3399CC', '33CCCC', '33FFCC', '6600CC', '6633CC', '6666CC', '6699CC', '66CCCC', '66FFCC',
        'FFFFFF', '2ECC40', '888888', '0000FF', '0033FF', '0066FF', '0099FF', '00CCFF', '00FFFF', '3300FF', '3333FF', '3366FF', '3399FF', '33CCFF', '33FFFF', '6600FF', '6633FF', '6666FF', '6699FF', '66CCFF', '66FFFF',
        'FF0000', '01FF70', '777777', '990000', '993300', '996600', '999900', '99CC00', '99FF00', 'CC0000', 'CC3300', 'CC6600', 'CC9900', 'CCCC00', 'CCFF00', 'FF0000', 'FF3300', 'FF6600', 'FF9900', 'FFCC00', 'FFFF00',
        '00FF00', 'FFDC00', '666666', '990033', '993333', '996633', '999933', '99CC33', '99FF33', 'CC0033', 'CC3333', 'CC6633', 'CC9933', 'CCCC33', 'CCFF33', 'FF0033', 'FF3333', 'FF6633', 'FF9933', 'FFCC33', 'FFFF33',
        '0000FF', 'FF851B', '555555', '990066', '993366', '996666', '999966', '99CC66', '99FF66', 'CC0066', 'CC3366', 'CC6666', 'CC9966', 'CCCC66', 'CCFF66', 'FF0066', 'FF3366', 'FF6666', 'FF9966', 'FFCC66', 'FFFF66',
        'FFFF00', 'FF4136', '444444', '990099', '993399', '996699', '999999', '99CC99', '99FF99', 'CC0099', 'CC3399', 'CC6699', 'CC9999', 'CCCC99', 'CCFF99', 'FF0099', 'FF3399', 'FF6699', 'FF9999', 'FFCC99', 'FFFF99',
        '00FFFF', '85144B', '333333', '9900CC', '9933CC', '9966CC', '9999CC', '99CCCC', '99FFCC', 'CC00CC', 'CC33CC', 'CC66CC', 'CC99CC', 'CCCCCC', 'CCFFCC', 'FF00CC', 'FF33CC', 'FF66CC', 'FF99CC', 'FFCCCC', 'FFFFCC',
        'FF00FF', 'B10DC9', '222222', '9900FF', '9933FF', '9966FF', '9999FF', '99CCFF', '99FFFF', 'CC00FF', 'CC33FF', 'CC66FF', 'CC99FF', 'CCCCFF', 'CCFFFF', 'FF00FF', 'FF33FF', 'FF66FF', 'FF99FF', 'FFCCFF', 'FFFFFF'];

    function createPaletteView($this) {
        var view = $('<table></table>');

        var parent = $('<tr></tr>').appendTo(view);

        var col = 0;
        for (var i = 0; i < PALETTE.length; ++i) {
            var color = '#' + PALETTE[i];

            $('<td></td>')
                .addClass('swatch')
                .css('background', color)
                .attr('data-color', color)
                .on('click', function () {
                    var color = IFColor.parseCSSColor($(this).attr('data-color'));
                    assignValue($this, color, false);
                    $this.trigger('colorchange', color);
                })
                .appendTo(parent);

            if (++col === MAX_SWATCHES_PER_ROW) {
                col = 0;
                parent = $('<tr></tr>').appendTo(view);
            }
        }

        return view;
    };

    function createSwatchesView($this) {
        var data = $this.data('gcolorpanel');

        return $('<div></div>')
            .gSwatchPanel({
                nullSwatch: $('<span></span>')
                    .addClass('fa fa-plus-circle'),
                // TODO : I18N
                nullName: 'Add current color as new swatch',
                types: [IFPattern.Type.Color],
                allowSelect: false
            })
            .on('swatchchange', function (evt, swatch) {
                if (!swatch) {
                    if (!data.scene || !data.color) {
                        return; // leave here, no color or scene
                    }

                    // Make sure there's no such color, yet
                    var swatches = data.scene.getSwatchCollection();
                    for (var node = swatches.getFirstChild(); node !== null; node = node.getNext()) {
                        if (node instanceof IFSwatch && node.getPatternType() === IFPattern.Type.Color) {
                            if (IFColor.equals(data.color, node.getProperty('pat'))) {
                                return; // leave here, colors are equal
                            }
                        }
                    }

                    // Ask for a name
                    var name = prompt('Enter a name for the new swatch:', data.color.asString());
                    if (name === null) {
                        return; // leave here, user has canceled
                    }
                    if (name.trim() === '') {
                        name = data.color.asString();
                    }

                    // Add current color as swatch
                    var editor = IFEditor.getEditor(data.scene);

                    if (editor) {
                        editor.beginTransaction();
                    }

                    try {
                        var swatch = new IFSwatch();
                        swatch.setProperties(['name', 'pat'], [name, data.color]);
                        swatches.appendChild(swatch);
                    } finally {
                        if (editor) {
                            editor.commitTransaction('Add Swatch');
                        }
                    }
                } else {
                    var color = swatch.getProperty('pat');
                    assignValue($this, color, false);
                    $this.trigger('colorchange', color);
                }
            });
    }

    function createTrendsView($this) {
        var _addTrend = function (index, view) {
            var label = null;
            switch (index) {
                // Tint
                case 1:
                    // TODO : I18N
                    label = 'Tint';
                    break;
                // Shade
                case 2:
                    label = 'Shade';
                    break;
                // Tone
                case 3:
                    label = 'Tone';
                    break;
            }


            $('<div></div>')
                .addClass('color-trend-label')
                .text(label)
                .appendTo(view);

            var container = $('<div></div>')
                .addClass('color-trend color-trend-' + index.toString())
                .append($('<div></div>')
                    .addClass('color-palette')
                    .append($('<div></div>')
                        .addClass('color-preview')))
                .append($('<div></div>')
                    .addClass('color-trend-value')
                    .append($('<input>')
                        .attr('type', 'text')
                        .on('input', function (evt) {
                            var val = $(this).val();
                            var color = updateTrendValue($this, index, val);
                        })))
                .appendTo(view);

            var preview = container.find('.color-preview');
            for (var i = 1; i <= 10; ++i) {
                $('<div>&nbsp;</div>')
                    .addClass('g-input color-trend-box-' + (i === 10 ? 'current' : i.toString()))
                    .css('width', '10%')
                    .on('click', function (evt) {
                        var color = IFColor.parseColor($(this).attr('data-color'));
                        if (color) {
                            assignValue($this, color, false);
                            $this.trigger('colorchange', color);
                        }
                    })
                    .appendTo(preview);
            }
        }.bind(this);

        var view = $('<div></div>');

        _addTrend(1, view);
        _addTrend(2, view);
        _addTrend(3, view);

        return view;
    }

    function colorForTrendAndValue($this, trend, value) {
        var sourceColor = $this.data('gcolorpanel').color;
        if (!sourceColor) {
            return null;
        }

        // Calculate a new color
        switch (trend) {
            // Tint
            case 1:
                return sourceColor.withTint(value);

            // Shade
            case 2:
                return sourceColor.withShade(value);

            // Tone
            case 3:
                return sourceColor.withTone(value);

            default:
                throw new Error('Unknown trend: ' + trend);
        }
    };

    function updateTrendValue($this, trend, value) {
        if (typeof value === 'string') {
            value = parseInt(value);
            if (isNaN(value)) {
                value = 50;
            }
        }
        if (value < 0) {
            value = 0;
        } else if (value > 100) {
            value = 100;
        }


        var trendsView = $this.find('[data-view="trends"]');
        var container = trendsView.find('.color-trend-' + trend.toString());

        var newColor = colorForTrendAndValue($this, trend, value);

        container.find('.color-trend-box-current')
            .attr('data-color', newColor ? newColor.asString() : '')
            .css('background', IFPattern.asCSSBackground(newColor));

        container.find('.color-trend-value > input')
            .val(value);

        return newColor;
    }

    function updateTrends($this) {
        var trendsView = $this.find('[data-view="trends"]');

        for (var i = 1; i <= 3; ++i) {
            var container = trendsView.find('.color-trend-' + i.toString());
            for (var k = 1; k <= 9; ++k) {
                var newColor = colorForTrendAndValue($this, i, k * 10);

                // Assign to color box
                container
                    .find('.color-trend-box-' + k.toString())
                    .attr('data-color', newColor ? newColor.asString() : '')
                    .css('background', IFPattern.asCSSBackground(newColor));

                // If this is 50% then assign to current trend box
                // and update it's text input
                if (k === 5) {
                    updateTrendValue($this, i, 50);
                }
            }
        }
    }

    function cvColorThiefColor(color) {
        return new IFColor(IFColor.Type.RGB, [color[0], color[1], color[2], 100]);
    }

    function createImageView($this) {
        return $('<div></div>')
            .append($('<div></div>')
                .addClass('image-panel')
                .text('Drag an image here')
                .on('dragenter', function () {
                    $(this).css('background', 'maroon');
                    return false;
                })
                .on('dragleave', function () {
                    $(this).css('background', '');
                    return false;
                })
                .on('dragover', function () {
                    return false;
                })
                .on('drop', function (event) {
                    var imagePanel = $(this);
                    imagePanel.css('background', '');

                    var palettePanel = imagePanel.closest('[data-view]').find('.image-palette');
                    palettePanel.empty();

                    var _addPaletteColor = function (color) {
                        $('<div></div>')
                            .css('background', IFPattern.asCSSBackground(color))
                            .on('click', function () {
                                assignValue($this, color, false);
                                $this.trigger('colorchange', color);
                            }.bind(this))
                            .appendTo(palettePanel);
                    }.bind(this);

                    var files = event.originalEvent.dataTransfer.files;
                    var fileCount = files.length;
                    var imageType = /image.*/;

                    for (var i = 0; i < fileCount; i++) {
                        var file = files[i];

                        if (file.type.match(imageType)) {
                            var reader = new FileReader();
                            reader.onload = function (event) {
                                var image = new Image();
                                image.src = event.target.result;
                                image.onload = function () {
                                    var colorThief = new ColorThief();
                                    var mainColor = cvColorThiefColor(colorThief.getColor(image));
                                    _addPaletteColor(mainColor);

                                    var palette = colorThief.getPalette(image, 8);
                                    for (var i = 0; i < palette.length; ++i) {
                                        var convertedColor = cvColorThiefColor(palette[i]);

                                        // Take care to avoid duplications with dominant color
                                        if (!IFColor.equals(convertedColor, mainColor)) {
                                            _addPaletteColor(convertedColor);
                                        }
                                    }
                                }.bind(this);

                                imagePanel
                                    .css('background-image', 'url(' + event.target.result + ')')
                                    .text('');
                            }.bind(this);
                            reader.readAsDataURL(file);
                            break;
                        }
                    }

                    return false;
                }))
            .append($('<div></div>')
                .addClass('image-palette'));
    }

    function createView($this, viewType) {
        var view = null;

        if (viewType === ViewType.Palette) {
            view = createPaletteView($this);
        } else if (viewType === ViewType.Swatches) {
            view = createSwatchesView($this);
        } else if (viewType === ViewType.Trends) {
            view = createTrendsView($this);
        } else if (viewType === ViewType.Image) {
            view = createImageView($this);
        } else {
            throw new Error('Unknown color view: ' + viewType);
        }

        if (view) {
            view
                .attr('data-view', viewType)
                .css('display', 'none')
                .appendTo($this.find('.color-view'));
        }
    }

    function updateMatches($this) {
        var data = $this.data('gcolorpanel');
        var palettePanel = $this.find('.matcher-palette');
        palettePanel.empty();

        if (data.matcher && data.color) {
            var _addMatchColor = function (color, width) {
                $('<div></div>')
                    .css('width', width.toString() + '%')
                    .css('background', IFPattern.asCSSBackground(color))
                    .on('click', function () {
                        assignValue($this, color, false);
                        $this.trigger('colorchange', color);
                    }.bind(this))
                    .appendTo(palettePanel);
            }.bind(this);

            var matches = data.matcher.match(data.color);
            if (matches && matches.length > 0) {
                var len = Math.min(matches.length, 8);
                var width = 100 / len;
                for (var i = 0; i < len; ++i) {
                    // Convert match color to same type as curent color if any
                    var match = data.color ? matches[i].toType(data.color.getType()) : matches[i];
                    _addMatchColor(match, width);
                }
            }
        }
    };

    function activateMatcher($this, matcher) {
        var data = $this.data('gcolorpanel');
        data.matcher = matcher;

        updateMatches($this);
    };

    function activateColorMode($this, colorMode) {
        var data = $this.data('gcolorpanel');

        if (!data.colorMode || colorMode !== data.colorMode.type.key) {
            for (var i = 0; i < ColorModes.length; ++i) {
                var modeInfo = ColorModes[i];
                if (modeInfo.type.key === colorMode) {
                    data.colorMode = modeInfo;

                    // Activate sliders
                    for (var i = 0; i < 4; ++i) {
                        var componentPanel = $this.find('.color-component-' + i.toString());

                        if (i >= modeInfo.components.length) {
                            componentPanel.css('visibility', 'hidden');
                        } else {
                            componentPanel.css('visibility', '');

                            var component = modeInfo.components[i];
                            var range = componentPanel.find('input[type="range"]');
                            var label = componentPanel.find('.color-label');
                            var unit = componentPanel.find('.color-unit');

                            label.text(component.label);
                            unit.text(component.unit);
                            unit.css('display', component.unit != '' ? '' : 'none');

                            range.attr('min', component.min);
                            range.attr('max', component.max);
                        }
                    }

                    updateToComponents($this);
                    updateFromComponents($this);

                    break;
                }
            }
        }
        $this.find('.color-mode-select').val(data.colorMode ? data.colorMode.type.key : IFColor.Type.RGB.key);
    }

    function updateFromComponents($this) {
        var data = $this.data('gcolorpanel');

        // Collect component values / correct them for current mode
        var components = [];
        for (var i = 0; i < data.colorMode.components.length; ++i) {
            var component = data.colorMode.components[i];
            var componentEl = $this.find('.color-component-' + i.toString());
            var textInput = componentEl.find('input[type="text"]');
            var rangeInput = componentEl.find('input[type="range"]');
            var value = parseInt(textInput.val());

            if (isNaN(value) || value < component.min) {
                value = component.min;
            } else if (value > component.max) {
                value = component.max;
            }

            // Push value
            components.push(value);

            // Update inputs with correct value
            textInput.val(value);
            rangeInput.val(value);
        }

        var color = data.colorMode.makeColor(components);
        assignValue($this, color);
        return color;
    }

    function updateToComponents($this) {
        var data = $this.data('gcolorpanel');

        var color = data.color ? data.color : IFColor.TRANSPARENT_WHITE;

        // Get the components in the right format
        var components = null;
        if (data.colorMode.type === IFColor.Type.RGB) {
            components = color.asRGB();
        } else if (data.colorMode.type === IFColor.Type.HSL) {
            components = color.asHSL();
        } else if (data.colorMode.type === IFColor.Type.Tone) {
            components = color.asTone();
        } else if (data.colorMode.type === IFColor.Type.CMYK) {
            components = color.asCMYK();
        } else {
            throw new Error('Unknown mode.');
        }

        if (components) {
            for (var i = 0; i < data.colorMode.components.length; ++i) {
                var component = data.colorMode.components[i];
                var componentEl = $this.find('.color-component-' + i.toString());
                var textInput = componentEl.find('input[type="text"]');
                var rangeInput = componentEl.find('input[type="range"]');
                var val = Math.min(component.max, Math.max(component.min, components[i])).toFixed(0);

                var stopsFunc = data.colorMode.components[i].stops;
                var stops = stopsFunc ? stopsFunc(components) : null;

                if (stops) {
                    if (stops.length === 1) {
                        rangeInput.css('background', stops[0].asCSSString());
                    } else {
                        var cssStops = '';
                        for (var s = 0; s < stops.length; ++s) {
                            if (cssStops !== '') {
                                cssStops += ',';
                            }
                            cssStops += stops[s].asCSSString();
                        }
                        rangeInput.css('background', 'linear-gradient(90deg, ' + cssStops + ')');
                    }
                } else {
                    rangeInput.css('background', '');
                }

                textInput.val(val);
                rangeInput.val(val);
            }
        }
    }

    function assignValue($this, value, overwritePrevious) {
        var data = $this.data('gcolorpanel');

        value = typeof value === 'string' ? IFColor.parseColor(value) : value;

        data.color = value;

        if (overwritePrevious) {
            data.previousColor = value;
        }

        $this.find('input[type="color"]').val(value ? value.asHTMLHexString() : '');
        $this.find('.previous-color').css('background', IFPattern.asCSSBackground(data.previousColor));
        $this.find('.current-color').css('background', IFPattern.asCSSBackground(data.color));
        $this.find('.color-input').val(data.color ? data.color.asHTMLHexString() : '');

        // Show color difference
        var colorDiff = '&ndash;';
        if (data.previousColor && data.color) {
            var diff = data.color.difference(data.previousColor);
            colorDiff = '&Delta;&nbsp;' + (diff < 0 ? ifUtil.formatNumber(diff, 2) : diff.toFixed(0));
        }
        $this.find('.color-difference').html(colorDiff);


        activateColorMode($this, value ? value.getType().key : IFColor.Type.RGB.key);
        updateMatches($this);
        updateToComponents($this);
        updateTrends($this);
    }

    var methods = {
        init: function (options) {
            options = $.extend({
                // The default view
                defaultView: ViewType.Palette
            }, options);

            return this.each(function () {
                var self = this;

                var data = {
                    options: options,
                    allowClear: false,
                    scene: null
                };

                var $this = $(this)
                    .data('gcolorpanel', data);

                $this
                    .addClass('g-color-panel')
                    .append($('<input>')
                        .attr('type', 'color')
                        .css({
                            'position': 'absolute',
                            'visibility': 'hidden'
                        })
                        .on('change', function () {
                            var color = IFColor.parseCSSColor($(this).val());
                            assignValue($this, color, false);
                            $this.trigger('colorchange', color);
                        }))
                    .append($('<div></div>')
                        .addClass('toolbar')
                        .append($('<div></div>')
                            .addClass('section-start')
                            .append($('<button></button>')
                                .attr('data-action', 'clear')
                                // TODO : I18N
                                .attr('title', 'Clear Color')
                                .css('display', 'none')
                                .append($('<span></span>')
                                    .addClass('fa fa-ban'))
                                .on('click', function () {
                                    assignValue($this, null, false);
                                    $this.trigger('colorchange', null);
                                }))
                            .append($('<button></button>')
                                .attr('data-action', 'system-color')
                                // TODO : I18N
                                .attr('title', 'System')
                                .append($('<span></span>')
                                    .addClass('fa fa-cog'))
                                .on('click', function () {
                                    $this.find('input[type="color"]').trigger('click');
                                })))
                        .append($('<div></div>')
                            .addClass('section-center')
                            .append($('<button></button>')
                                .attr('data-activate-view', ViewType.Palette)
                                // TODO : I18N
                                .attr('title', 'Palette')
                                .append($('<span></span>')
                                    .addClass('fa fa-th')))
                            .append($('<button></button>')
                                .attr('data-activate-view', ViewType.Swatches)
                                // TODO : I18N
                                .attr('title', 'Swatches')
                                .css('display', 'none') // of by default
                                .append($('<span></span>')
                                    .addClass('fa fa-bars')))
                            .append($('<button></button>')
                                .attr('data-activate-view', ViewType.Trends)
                                // TODO : I18N
                                .attr('title', 'Trends')
                                .append($('<span></span>')
                                    .addClass('fa fa-sliders')))
                            .append($('<button></button>')
                                .attr('data-activate-view', ViewType.Image)
                                // TODO : I18N
                                .attr('title', 'From Image')
                                .append($('<span></span>')
                                    .addClass('fa fa-image'))))
                        .append($('<div></div>')
                            .addClass('section-end')
                            .append($('<select></select>')
                                .addClass('color-mode-select')
                                .on('change', function () {
                                    activateColorMode($this, $(this).val());
                                }))))
                    .append($('<div></div>')
                        .addClass('color-view'))
                    .append($('<div></div>')
                        .addClass('color-components'))
                    .append($('<hr/>'))
                    .append($('<div></div>')
                        .addClass('color')
                        .append($('<div></div>')
                            .append($('<div>&nbsp;</div>')
                                .addClass('previous-color g-input')
                                .on('click', function () {
                                    if (data.previousColor) {
                                        assignValue($this, data.previousColor, false);
                                        $this.trigger('colorchange', data.previousColor);
                                    }
                                }))
                            .append($('<div>&nbsp;</div>')
                                .addClass('current-color g-input'))
                            .append($('<div></div>')
                                .addClass('color-difference g-input')
                                // TODO : I18N
                                .attr('title', 'Color Difference (CIEDE2000)'))
                            .append($('<input>')
                                .addClass('color-input')
                                .on('change', function () {
                                    var color = IFColor.parseCSSColor($(this).val());
                                    if (color) {
                                        assignValue($this, color, false);
                                        $this.trigger('colorchange', color);
                                    }
                                })))
                        .append($('<div></div>')
                            .append($('<select></select>')
                                .addClass('matcher-select')
                                .on('change', function () {
                                    activateMatcher($this, $(this).find(':selected').data('matcher'));
                                }))))
                    .append($('<div></div>')
                        .addClass('matcher-palette'));

                $this.find('[data-activate-view]').each(function (index, element) {
                    var $element = $(element);
                    $element
                        .on('click', function (evt) {
                            methods.view.call(self, $element.attr('data-activate-view'));
                        });
                });

                // Initiate components
                var components = $this.find('.color-components');
                var _addComponent = function (index) {
                    $('<div></div>')
                        .addClass('color-component color-component-' + index.toString())
                        .append($('<div></div>')
                            .addClass('color-label')
                            .on('click', function () {
                                var input = $this.find('.color-component-' + index.toString() + ' input[type="text"]');
                                if (input.val() == data.colorMode.components[index].max) {
                                    input.val(data.colorMode.components[index].min);
                                } else {
                                    input.val(data.colorMode.components[index].max);
                                }

                                var color = updateFromComponents($this);
                                $this.trigger('colorchange', color);
                            }.bind(this)))
                        .append($('<div></div>')
                            .addClass('color-range')
                            .append($('<input>')
                                .attr('type', 'range')
                                .attr('tabIndex', '-1')
                                .on('input', function (evt) {
                                    $this.find('.color-component-' + index.toString() + ' input[type="text"]').val($(evt.target).val());
                                    var color = updateFromComponents($this);
                                    $this.trigger('colorchange', color);
                                }.bind(this))))
                        .append($('<div></div>')
                            .addClass('color-value')
                            .append($('<input>')
                                .attr('type', 'text')
                                .on('input', function () {
                                    var color = updateFromComponents($this);
                                    $this.trigger('colorchange', color);
                                })))
                        .append($('<div></div>')
                            .addClass('color-unit'))
                        .appendTo(components);
                }.bind(this);

                for (var i = 0; i < 4; ++i) {
                    _addComponent(i);
                }

                // Init color modes
                var colorModeSelect = $this.find('.color-mode-select');
                for (var i = 0; i < ColorModes.length; ++i) {
                    var modeInfo = ColorModes[i];
                    $('<option></option>')
                        .attr('value', modeInfo.type.key)
                        .text(modeInfo.name)
                        .appendTo(colorModeSelect);

                    if (!data.colorMode) {
                        activateColorMode($this, modeInfo.type.key);
                    }
                }

                // Initiate matchers
                var matcherSelect = $this.find('.matcher-select');
                var matcherGroup = matcherSelect;
                var lastCategory = null;
                for (var i = 0; i < gravit.colorMatchers.length; ++i) {
                    var matcher = gravit.colorMatchers[i];
                    var category = ifLocale.get(matcher.getCategory());

                    // Add to selector
                    if (!lastCategory || category !== lastCategory) {
                        matcherGroup = $('<optgroup></optgroup>')
                            .attr('label', category)
                            .appendTo(matcherSelect);
                        lastCategory = category;
                    }

                    $('<option></option>')
                        .data('matcher', matcher)
                        .text(ifLocale.get(matcher.getTitle()))
                        .appendTo(matcherGroup);

                    if (!data.matcher) {
                        activateMatcher($this, matcher);
                    }
                }

                // Init views
                for (var view in ViewType) {
                    if (ViewType.hasOwnProperty(view)) {
                        createView($this, ViewType[view]);
                    }
                }

                // Set default view
                methods.view.call(self, options.defaultView);
            });
        },

        view: function (value) {
            var self = this;
            var $this = $(this);
            var data = $this.data('gcolorpanel');

            if (!arguments.length) {
                return data.view;
            } else {
                if (value !== data.view) {
                    data.view = value;

                    $this.find('[data-activate-view]').each(function (index, element) {
                        var $element = $(element);
                        $element.toggleClass('g-active', $element.attr('data-activate-view') === value);
                    });

                    $this.find('.color-view > *').each(function (index, element) {
                        var $element = $(element);
                        $element.css('display', $element.attr('data-view') === value ? '' : 'none');
                    });
                }
                return this;
            }
        },

        allowClear: function (value) {
            var $this = $(this);
            if (!arguments.length) {
                return $this.data('gcolorpanel').allowClear;
            } else {
                // TODO : Detach & Attach listeners & Change active view if swatches & value=null
                $this.data('gcolorpanel').allowClear = value;
                $this.find('[data-action="clear"]')
                    .css('display', value ? '' : 'none');
                return this;
            }
        },

        scene: function (value) {
            var $this = $(this);
            var data = $this.data('gcolorpanel');

            if (!arguments.length) {
                return data.scene;
            } else {
                var oldScene = data.scene;
                data.scene = value;

                // Update swatches
                var swatchView = $this.find('[data-view="' + ViewType.Swatches + '"]');
                if (oldScene) {
                    swatchView.gSwatchPanel('detach');
                }

                if (data.scene) {
                    swatchView.gSwatchPanel('attach', data.scene.getSwatchCollection());
                }

                $this.find('[data-activate-view="' + ViewType.Swatches + '"]')
                    .css('display', data.scene ? '' : 'none');

                return this;
            }
        },

        value: function (value) {
            var $this = $(this);
            if (!arguments.length) {
                return $this.data('gcolorpanel').color;
            } else {
                var data = $this.data('gcolorpanel');
                assignValue($this, value, true);

                if (data.scene && (!data.color || data.color.getType() === IFColor.Type.Black || data.color.getType() === IFColor.Type.White || data.color.getType() === IFColor.Type.Registration)) {
                    var clspace = data.scene.getProperty('clspace');
                    if (clspace) {
                        for (var i = 0; i < ColorModes.length; ++i) {
                            if (ColorModes[i].type.space === clspace) {
                                activateColorMode($this, ColorModes[i].type.key);
                                break;
                            }
                        }
                    }
                }

                return this;
            }
        }
    };

    /**
     * Block to transform divs to color panels
     */
    $.fn.gColorPanel = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}
    (jQuery)
    )
;
