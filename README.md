**Warning:** currently chai-react-suite is not tested well on different enviorments.
It works for my project, but may not play well for your's. Please open issue
if you have problems.

# Testing components

## Contents

* [`describeComponent`](#describecomponent) (`render` function and `helpers`)
* [Ensure that component render given text](#ensure-that-component-render-given-text)
* [Ensure that component's el/nested el has given class/text/attr](#ensure-that-components-elnested-el-has-given-classtextattr)
* [Ensure that component renders another component with given props/children](#ensure-that-component-renders-another-component-with-given-propschildren)
* [Ensure that component render collection of components (with props/children)]()
* [Ensure that component bind events](#ensure-that-component-render-collection-of-components-with-propschildren)
* [Ensure that component bind events](#ensure-that-component-bind-events)
* [Ensure that component calls given actions](#ensure-that-component-calls-given-actions)
* [Testing component mixins](#testing-component-mixins)

## `describeComponent`

`describeComponent` is a helper that simplify process of testing components.
Basically it does:

1. Prepares playground on `beforeEach` (you will have empty block where you
   can render component in test).
2. Creates `render` function that accepts props and children and that returns
   rendered DOM el; `render` passed as first argument to context function.
3. Passes helpers to context function as second argument.

``` js
var Component = rewire('component');

describeComponent(Component, function(render, helpers) {
  // Tests here.
});
```

### `render`

It accepts:

1. `props` - `Object` with props that will be passed to component (optional,
   can be `null`),
2. `children` - `*`, children that will be passed to component (optional).

``` js
// Will render described component with `{ color: 'red' }` as props and
// `'Children'` as children.
render({ color: 'red' }, 'Children');
```

`render` have `with` function that binds props and children to `render`:

``` js
var bindedRender = render.with({ color: 'red' }, 'Children');
// Will render described component with `{ color: 'red' }` as props and
// `'Children'` as children.
bindedRender();
```

### `helpers`

TODO

## Ensure that component render given text

``` js
it('renders children as text', function() {
  var text = 'Check, check, 1, 2, 3.';
  expect(render.with(null, text)).to.render.text(text);
});
```

## Ensure that component's el/nested el has given class/text/attr

### Compound expectation

Root element:

``` js
it('renders link with "is-red" class for `color` equals "red"', function() {
  expect(render.with({ color: 'red' }, 'Click me!')).to.render.el({
    is: '.is-red',
    href: '#',
    text: 'Click me!'
  });
});
```

Nested element:

``` js
it('renders link with "is-red" class for `color` equals "red"', function() {
  expect(render.with({ color: 'red' }, 'Click me!')).to.render.el({
    find: 'a',
    is: '.is-red',
    href: '#',
    text: 'Click me!',
    props: {
      disabled: false,
      value: 'Value'
    }
  });
});
```

### Has class name

``` js
expect(render).to.render.el.withClass('link');
```

### Match selector

``` js
expect(render).to.render.el.matches('a.link');
```

### Attr expectation

``` js
expect(render).to.render.el.withAttr('href', '#');
```

### Attrs expectation

``` js
expect(render).to.render.el.withAttrs({
  href: '#',
  rel: 'link'
});
```

### Prop expectation

``` js
expect(render).to.render.el.withProp('disabled', false);
```

### Props expectation

``` js
expect(render).to.render.el.withProps({
  disabled: false,
  value: 'Value'
});
```


### Has value

``` js
expect(render).to.render.el.withValue('Input value');
```

### Nested el

``` js
expect(render).to.render.el.contains('.link-icon');
```

## Ensure that component renders another component with given props/children

Component:

``` js
it('renders another component', function() {
  expect(render).to.render.component('AnotherComponent');
});
```

Component with props and children (expect props equality):

``` js
it('renders another component with specified props and children', function() {
  expect(render).to.render.component('AnotherComponent', {
    with: [
      {
        type: 'test',
        color: 'red'
      },
      'Text'
    ]
  });
});
```

Fuzzy match of props:

``` js
it('renders another component with specified props and children', function() {
  expect(render).to.render.component('AnotherComponent', {
    with: [
      match({
        type: 'test',
        color: 'red'
      }),
      'Text'
    ]
  });
});
```

## Ensure that component render collection of components (with props/children)

Works the same way as `component` but instead of props and children as second
and thrid arguments it accepts array of arrays.

``` js
it('renders another component with specified props and children', function() {
    expect(render).to.render.components('AnotherComponent', {
      with: [
        [{ type: 'test', color: 'red' }, 'Text'],
        [{ type: 'test', color: 'green' }, 'Text']
      ]
    });
});
```

## Ensure that component bind events

TODO

## Ensure that component calls given actions

TODO

## Testing component mixins

TODO
