var React = require('react/addons');
var cycle = require('cycle');
var PlaygroundTestHelpers = require('playground-test-helpers');

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
    fn.and = (andFunction)=> {
      fn.andFunction = andFunction;
      return fn;
    }
  };

  render.with = function(props, children) {
    var bindedRender = render.bind(PlaygroundTestHelpers, props, children);
    setComponentDataTo(bindedRender);
    setAndDataTo(bindedRender);
    return bindedRender;
  };

  setComponentDataTo(render);
  setAndDataTo(render);

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
    contextFn(render, helpers);
  });
};

module.exports = describeComponent;

