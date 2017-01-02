# Aesthetic with CSS Modules

Provides [Styletron](https://github.com/rtsao/styletron) support for
[Aesthetic](https://github.com/milesj/aesthetic), a React styling library.

## Requirements

* React 15+
* Aesthetic
* Styletron

## Installation

```
npm install aesthetic aesthetic-styletron styletron styletron-utils --save
// Or
yarn add aesthetic aesthetic-styletron styletron styletron-utils
```

## Usage

More information on how to get started can be found in the
[official documentation](https://github.com/milesj/aesthetic).

```javascript
import Aesthetic from 'aesthetic';
import StyletronAdapter from 'aesthetic-styletron';

const aesthetic = new Aesthetic(new StyletronAdapter());
```
