var React = require('react/addons');
var cycle = require('cycle');
var PlaygroundTestHelpers = require('playground-test-helpers');
var RedefineTestHelpers = require('redefine-test-helpers');

/**
 * Helper that simplifies describing of component. It takes component name,
 * prepares playground for tests and pass render to context function.
 *
 * @param {React component} Component
 * @param {function} contextFn
 */
var describeComponent = function(Component, contextFn) {

  var componentName = Component.displayName;

  var render = function(props, children) {
    var component = React.createElement(Component, props, children);
    return PlaygroundTestHelpers.$render(component, React);
  };

  var setComponentDataTo = function(fn) {
    fn.Component = Component;
    fn.componentName = componentName;
  };

  var setAndDataTo = function(fn) {
    fn.and = function(andFunction) {
      fn.andFunction = andFunction;
      return fn;
    }
  };

  var setRedefineDataTo = function(fn) {
    fn.restore = function() {};

    fn.redefined = function(redefineMap) {
      var proto = this.Component.type.prototype;

      var restoreOriginal = RedefineTestHelpers.redefine(proto, redefineMap);

      var restoreAutoBindMap;
      if (proto.__reactAutoBindMap) {
        var redefineMapFns = {};
        for (var key in redefineMap) {
          if (typeof redefineMap[key] == 'function') {
            redefineMapFns[key] = redefineMap[key];
          }
        }

        restoreAutoBindMap = RedefineTestHelpers.redefine(
          proto.__reactAutoBindMap, redefineMapFns
        );
      }

      fn.restore = function() {
        restoreOriginal();
        if (restoreAutoBindMap) {
          restoreAutoBindMap();
        }
      }

      return fn;
    };
  };

  var setDataToRender = function(render) {
    setComponentDataTo(render);
    setAndDataTo(render);
    setRedefineDataTo(render);
  };

  render.with = function(props, children) {
    var bindedRender = render.bind(PlaygroundTestHelpers, props, children);
    setDataToRender(bindedRender);
    return bindedRender;
  };

  setDataToRender(render);

  var helpers = {
    mockDepsFilter: function() {
      var DummyWhatever = React.createClass({
        render: function() {
          var propsJSON = JSON.stringify(cycle.decycle(this.props));
          var props = { className: this.props.className, 'data-props': propsJSON };
          var children = this.props.children;

          return React.DOM.div(props, children);
        }
      });

      var deps = {};
      var args = Array.prototype.slice.call(arguments);
      args.forEach(function(componentName) {
        deps[componentName] = DummyWhatever;
      });
      injectDependenciesFilter(Component, deps);
    },

    simulate: React.addons.TestUtils.Simulate,

    el: function() {
      return document.getElementById('playground').firstChild;
    }
  };

  describe(componentName, function() {
    beforeEach(PlaygroundTestHelpers.prepare);

    afterEach(function() {
      React.unmountComponentAtNode(document.getElementById('playground'));
      render.restore();
    });

    contextFn(render, helpers);
  });
};

module.exports = describeComponent;

