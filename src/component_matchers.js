var React = require('react');
var decycle = require('json-decycle/index').decycle;
var rewired = require('rewire-test-helpers').rewired;
var omit = require('lodash-node/modern/objects/omit');

/**
 * Set of Chai matchers aimed to simplify testing of React components.
 */
var componentMatchers = function(_chai, utils) {
  var Assertion = chai.Assertion;
  var flag = utils.flag;

  /**
   * Renders component and return $el
   *
   * @returns {jQuery object}
   */
  _renderComponent = function(context) {
    var obj = context._obj;
    var renderResult = obj();
    if (obj.andFunction) {
      obj.andFunction(jQuery(renderResult.el), renderResult.instance);
    }

    // We are returning not $component it self but content of playground
    // because in the "and" function state may be changed and old
    // element can be changed.
    return jQuery('#playground >');
  };

  /**
   * Chain property, sets render flag to true.
   */
  Assertion.addProperty('render', function() {
    var obj = this._obj;
    flag(this, 'render', true);
  });

  /**
   * Matcher that ensures that component renders given text.
   *
   * @example
   * expect(render.with(null, 'Click me!')).to.render.text('Click me!');
   */
  Assertion.addMethod('text', function(text) {
    if (!flag(this, 'render')) return;

    var $component = _renderComponent(this);

    this.assert(
      $component.is(":contains('" + text + "')"),
      'expected component to render text "' + text + '"',
      'expected component to not render text "' + text + '"'
    );
  });

  /**
   * @param {Object} context chai context
   * @param {jQuery object} $el
   * @param {string} selector
   */
  var _expectToContainElement = function(context, $el, selector) {
    context.assert(
      $el.length >= 1,
      'expected component to contain el "' + selector + '"',
      'expected component to not contain el "' + selector + '"'
    );
  };

  /**
   * @param {Object} context chai context
   * @param {jQuery object} $el
   * @param {string} attrName
   * @param {string} value
   */
  var _expectToHaveAttr = function(context, $el, attrName, value) {
    if (value && value.constructor && value.constructor == RegExp) {
      var attr = $el.attr(attrName);
      context.assert(
        value.test(attr),
        'expected el to have attr "' + attrName + '" matches "' + value + '"',
        'expected el to not have attr "' + attrName + '" matches "' + value + '"'
      );

    } else {
      context.assert(
        $el.is("[" + attrName + "='" + value + "']"),
        'expected el to have attr "' + attrName + '" equal to "' + value + '"',
        'expected el to not have attr "' + attrName + '" equal to "' + value + '"'
      );
    }
  };

  /**
   * @param {Object} context chai context
   * @param {jQuery object} $el
   * @param {string} attrs
   */
  var _expectToHaveAttrs = function(context, $el, attrs) {
    Object.keys(attrs).forEach(function(attrName) {
      var value = attrs[attrName];
      _expectToHaveAttr(context, $el, attrName, value);
    });
  };

  /**
   * @param {Object} context chai context
   * @param {jQuery object} $el
   * @param {string} propName
   * @param {string} value
   */
  var _expectToHaveProp = function(context, $el, propName, value) {
    context.assert(
      $el.prop(propName) == value,
      'expected el to have prop "' + propName + '" equal to "' + value + '"',
      'expected el to not have prop "' + propName + '" equal to "' + value + '"'
    );
  };

  /**
   * @param {Object} context chai context
   * @param {Object} $el
   * @param {string} props
   */
  var _expectToHaveProps = function(context, $el, props) {
    Object.keys(props).forEach(function(propName) {
      var value = props[propName];
      _expectToHaveProp(context, $el, propName, value);
    });
  };

  /**
    * @param {object} context chai context
    * @param {jQuery object} $el
    * @param {string} selector
   */
  var _expectToMatchSelector = function(context, $el, selector) {
    context.assert(
      $el.is(selector),
      'expected el to match "' + selector + '"',
      'expected el to not match "' + selector + '"'
    );
  };

  /**
    * @param {object} context chai context
    * @param {jQuery object} $el
    * @param {string} expectedValue
   */
  var _expectToHaveValue = function(context, $el, expectedValue) {
    var actualValue = $el.val();
    context.assert(
      expectedValue == actualValue,
      'expected el to have value "' + expectedValue + '" but have "' + actualValue + '"',
      'expected el to not have value "' + expectedValue + '" but have "' + actualValue + '"'
    );
  };

  /**
    * @param {Object} context chai context
    * @param {jQuery object} $el
    * @param {string} text
   */
  var _expectToContainText = function(context, $el, text) {
    context.assert(
      $el.is(":contains('" + text + "')"),
      'expected component to render text "' + text + '"',
      'expected component to not render text "' + text + '"'
    );
  };

  /**
   * Matcher that ensures that component's el/nested el has given
   * class/text/attr.
   * @param {Object} expectations object
   *
   * @example
   * expect(render.with({ color: red }, 'Click me!')).to.render.el({
   *   is: '.is-red',
   *   href: '#',
   *   text: 'Click me!'
   * });
   *
   * @example
   * expect(render.with({ color: red }, 'Click me!')).to.render.el({
   *   find: 'a',
   *   is: '.is-red',
   *   href: '#',
   *   text: 'Click me!'
   * });
   */
  Assertion.addChainableMethod('el', function(expectations) {
    if (!flag(this, 'render')) return;

    var $component = _renderComponent(this);

    var attrs = omit(expectations, 'find', 'is', 'text', 'value', 'props');

    var $el;
    if (expectations.find) {
      var selector = expectations.find;
      $el = $component.find(selector);
      _expectToContainElement(this, $el, selector);

    } else {
      $el = $component;
    }

    if (expectations.is) _expectToMatchSelector(this, $el, expectations.is);
    if (expectations.text) _expectToContainText(this, $el, expectations.text);
    if (expectations.value) _expectToHaveValue(this, $el, expectations.value);
    if (expectations.props) _expectToHaveProps(this, $el, expectations.props);

    _expectToHaveAttrs(this, $el, attrs);

  }, function() {
    if (!flag(this, 'render')) return;

    var $component = _renderComponent(this);

    flag(this, '$component', $component);
  });

  /**
    * Matcher that ensures that component have specefied class.
    * @param {string} className
   */
  Assertion.addMethod('withClass', function(className) {
    var $component = flag(this, '$component');
    if (!$component) return;
    _expectToMatchSelector(this, $component, '.' + className);
  });

  /**
    * Matcher that ensures that component have expected value.
    * @param {string} className
   */
  Assertion.addMethod('withValue', function(value) {
    var $component = flag(this, '$component');
    if (!$component) return;
    _expectToHaveValue(this, $component, value);
  });

  /**
   * Matcher that ensures that component match selector.
   * @param {string} selector
   */
  Assertion.addMethod('matches', function(selector) {
    var $component = flag(this, '$component');
    if (!$component) return;
    _expectToMatchSelector(this, $component, selector);
  });

  /**
   * Matcher that ensures that component's attr has specific value.
   * @param {string} attrName
   * @param {string} value
   */
  Assertion.addMethod('withAttr', function(attrName, value) {
    var $component = flag(this, '$component');
    if (!$component) return;
    _expectToHaveAttr(this, $component, attrName, value);
  });

  /**
   * Matcher that ensures that component have specific attrs.
   * @param {Object} attrs
   */
  Assertion.addMethod('withAttrs', function(attrs) {
    var $component = flag(this, '$component');
    if (!$component) return;
    _expectToHaveAttrs(this, $component, attrs);
  });

  /**
   * Matcher that ensures that component's prop has specific value.
   * @param {string} propName
   * @param {string} value
   */
  Assertion.addMethod('withProp', function(propName, value) {
    var $component = flag(this, '$component');
    if (!$component) return;
    _expectToHaveProp(this, $component, propName, value);
  });

  /**
   * Matcher that ensures that component have specific props.
   * @param {Object} props
   */
  Assertion.addMethod('withProps', function(props) {
    var $component = flag(this, '$component');
    if (!$component) return;
    _expectToHaveProps(this, $component, props);
  });


  /**
   * Matcher that ensures that component have nested el matches passed selector.
   * @param {string} selector
   */
  Assertion.addMethod('contains', function(selector) {
    var $component = flag(this, '$component');
    if (!$component) return;
    var $el = $component.find(selector);
    _expectToContainElement(this, $el, selector);
  });

  /**
   * @param {Object} context chai context
   * @param {string} componentName
   * @param {SinonSpy} spy
   */
  var _expectComponentToRender = function(context, componentName, spy) {
    context.assert(
      spy.called,
      'expected component to render ' + componentName,
      'expected component to not render ' + componentName
    )
  }

  /**
   * @param {Object} context chai context
   * @param {string} componentName
   * @param {SinonSpy} spy
   * @param {*[]} args
   */
  var _expectComponentToRenderWith =
    function(context, componentName, spy, args) {

    if (args[0] === null) args[0] = match({});

    var errorMessageEnd;
    if (spy.called) {
      errorMessageEnd =
        'but called with ' + JSON.stringify(decycle(spy.args));
    } else {
      errorMessageEnd = 'but never been called';
    }

    context.assert(
      spy.calledWith.apply(spy, args),
      'expected component to render ' + componentName + ' with ' +
      JSON.stringify(args) + ' ' + errorMessageEnd,
      'expected component to not render ' + componentName + ' with ' +
      JSON.stringify(args) + ' ' + errorMessageEnd
    );
  };

  /**
   * Matcher that ensures that component render another component(s)
   * @param {ReactComponent} componentName
   * @param {boolean} single
   * @param {Object} options
   */
  var _expectComponentToRenderComponent = function(componentName, single, options) {
    if (!flag(this, 'render')) return;
    options = options || {};
    var negate = flag(this, 'negate');

    var Component = this._obj.Component;

    var renderSpy = sinon.spy()
    var DummyComponent = React.createClass({
      render: function() {
        renderSpy(this.props, this.props.children)
        return null
      }
    });

    var $component;

    var overrides = {};
    overrides[componentName] = DummyComponent;
    rewired(Component, overrides, function() {
      $component = _renderComponent(this);
    }.bind(this));

    if (!negate || !options.with) {
      _expectComponentToRender(this, componentName, renderSpy);
    }

    if (options.with) {
      if (single) {
        _expectComponentToRenderWith(this, componentName, renderSpy, options.with);
      } else {
        options.with.forEach(
          _expectComponentToRenderWith.bind(null, this, componentName, renderSpy)
        );
      }
    }
  };

  /**
   * Matcher that ensures that component render another component
   * @param {ReactComponent} componentName
   * @param {Object} options
   */
  Assertion.addMethod('component', function(componentName, options) {
    _expectComponentToRenderComponent.call(this, componentName, true, options);
  });

  /**
   * Matcher that ensures that component render another component
   * @param {ReactComponent} componentName
   * @param {Object} options
   */
  Assertion.addMethod('components', function(componentName, options) {
    _expectComponentToRenderComponent.call(this, componentName, false, options);
  });
};

module.exports = componentMatchers;
