var ReactDOM = require('react-dom');

var PLAYGROUND_ID = 'playground';

var Playground = {
  // Returns playground DOM element
  get: function() {
    return document.getElementById(PLAYGROUND_ID);
  },

  prepare: function() {
    var playground = Playground.get();

    if (!playground) {
      playground = document.createElement('div');
      playground.id = PLAYGROUND_ID;
      document.body.appendChild(playground);
    }

    playground.innerHTML = '';
  },

  unmount: function() {
    ReactDOM.unmountComponentAtNode(Playground.get());
  },

  filter: function() {
    beforeEach(this.prepare);
    afterEach(this.unmount);
  },

  render: function(Component) {
    var playgroundEl = Playground.get();
    var componentInstance = ReactDOM.render(Component, playgroundEl);
    var componentEl = playgroundEl.firstChild;

    return { el: componentEl, instance: componentInstance };
  },
};

module.exports = Playground;

