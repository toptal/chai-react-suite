var React = require('react/addons');
var cycle = require('cycle');
var Playground = require('./playground');
var RedefineTestHelpers = require('redefine-test-helpers');

// Helper that simplifies describing of component. It takes component name,
// prepares playground for tests and pass render to context function.
//
// Component - React component
// describeBodyFn - function that will be called in context of describe
var describeComponent = function(Component, describeBodyFn) {
  var componentName = Component.displayName;

  var render = function(props, children) {
    var component = React.createElement(Component, props, children);
    return Playground.render(component);
  };

  render.with = function(props, children) {
    var bindedRender = render.bind(render, props, children);
    setDataTo(bindedRender);
    return bindedRender;
  };

  setDataTo(render);

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
    Playground.filter();

    afterEach(function() {
      render.restore();
    });

    describeBodyFn(render, helpers);
  });

  function setComponentDataTo(fn) {
    fn.Component = Component;
    fn.componentName = componentName;
  }

  function setAndDataTo(fn) {
    fn.and = function(andFunction) {
      fn.andFunction = andFunction;
      return fn;
    }
  }

  function setRedefineDataTo(fn) {
    fn.restore = function() {};

    fn.redefined = function(overrides) {
      var proto = this.Component.type.prototype;

      var restoreOriginal = RedefineTestHelpers.redefine(proto, overrides);

      var restoreAutoBindMap;
      if (proto.__reactAutoBindMap) {
        var overridesFns = {};
        for (var key in overrides) {
          if (typeof overrides[key] == 'function') {
            overridesFns[key] = overrides[key];
          }
        }

        restoreAutoBindMap = RedefineTestHelpers.redefine(
          proto.__reactAutoBindMap, overridesFns
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
  }

  function setDataTo(fn) {
    setComponentDataTo(fn);
    setAndDataTo(fn);
    setRedefineDataTo(fn);
  }
};

module.exports = describeComponent;

